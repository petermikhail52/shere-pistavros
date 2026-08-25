import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/shere-pistavros/"
});

const SYNAXARIUM_URL = "https://r.jina.ai/http://www.copticchurch.net/synaxarium/all/en";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const IMAGE_ROOT = fileURLToPath(new URL("../../Images/", import.meta.url));
const MANIFEST_PATH = join(IMAGE_ROOT, "synaxarium-icon-review-manifest.json");
const DENIALS_PATH = join(IMAGE_ROOT, "synaxarium-icon-review-denials.json");
const REQUEST_DELAY_MS = 3_000;
const MAX_RETRIES = 4;

const args = process.argv.slice(2);
const getOption = (name, fallback) => {
  const index = args.indexOf(name);
  return index === -1 ? fallback : Number(args[index + 1]) || fallback;
};
const allSaints = args.includes("--all");
const saintLimit = allSaints ? Infinity : getOption("--limit", 12);
const candidatesPerSaint = Math.min(12, Math.max(3, getOption("--per-saint", 8)));

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const normalize = (value) => value
  .toLowerCase()
  .replace(/\bsaint\b|\bsts?\.?\b|\banba\b|\babba\b|\bpope\b/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();
const slugify = (value) => normalize(value).replace(/\s+/g, "-").slice(0, 72) || "saint";

const fetchWithBackoff = async (url) => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": "SherePistavros/1.0 (local icon review collector)" },
    });
    if (response.ok) return response;
    if (response.status !== 429 || attempt === MAX_RETRIES) throw new Error(`Request failed: ${response.status}`);
    const retryAfterSeconds = Number(response.headers.get("retry-after")) || 60;
    console.log(`rate limited; waiting ${retryAfterSeconds}s before retrying`);
    await sleep(retryAfterSeconds * 1_000);
  }
  throw new Error("Request failed after retries");
};

const extractSaintLabels = (text) => {
  const labels = new Map();
  for (const line of text.split("\n")) {
    const commemoration = line.match(/^\[[A-Za-z]+ \d+\]\([^)]*\)(.+)$/)?.[1];
    const label = commemoration?.match(/\b(?:St\.|Saint|Anba|Abba|Pope)\s+[^.,;]+/i)?.[0]?.trim();
    if (label) labels.set(normalize(label), label);
  }
  return [...labels.values()];
};

const searchCommons = async (label, tradition, query) => {
  const params = new URLSearchParams({
    action: "query", format: "json", generator: "search", gsrnamespace: "6", gsrlimit: "10",
    gsrsearch: query, prop: "imageinfo", iiprop: "url|mime|size|extmetadata", iiurlwidth: "900",
  });
  const response = await fetchWithBackoff(`${COMMONS_API}?${params}`);
  const data = await response.json();
  return Object.values(data.query?.pages || {}).map((page) => {
    const image = page.imageinfo?.[0];
    return image ? { title: page.title, tradition, ...image } : null;
  }).filter(Boolean);
};

const isReviewCandidate = (image) => {
  const invalidTitle = /\b(photo|photograph|church building|map|flag|diagram|coat of arms)\b/.test(image.title.toLowerCase());
  return Boolean(image.extmetadata?.LicenseShortName?.value)
    && image.mime?.startsWith("image/") && !image.mime.includes("svg")
    && image.width >= 350 && image.height >= 350 && !invalidTitle;
};

const scoreCandidate = (image, label) => {
  const title = normalize(image.title);
  const labelWords = normalize(label).split(" ").filter((word) => word.length > 3);
  const labelHits = labelWords.filter((word) => title.includes(word)).length;
  const traditionScore = image.tradition === "Coptic" ? 30 : image.tradition === "Greek" ? 20 : 10;
  return traditionScore + Math.min(25, Math.round(Math.min(image.width, image.height) / 80)) + labelHits * 15;
};

const downloadCandidate = async (image, label, index) => {
  const response = await fetchWithBackoff(image.thumburl || image.url);
  const mime = response.headers.get("content-type")?.split(";")[0];
  const extension = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }[mime];
  if (!extension) throw new Error("Commons result was not a supported raster image");
  const folder = join(IMAGE_ROOT, "icon-review", slugify(label));
  await mkdir(folder, { recursive: true });
  const filename = `${String(index + 1).padStart(2, "0")}-${image.tradition.toLowerCase()}${extension}`;
  await writeFile(join(folder, filename), Buffer.from(await response.arrayBuffer()));
  return `/icon-review/${slugify(label)}/${filename}`;
};

const loadManifest = async () => {
  try {
    const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
    if (manifest.version === 2 && Array.isArray(manifest.candidates)) return manifest;
  } catch {
    // No saved review queue yet.
  }
  return { version: 2, generatedAt: new Date().toISOString(), source: "Wikimedia Commons", candidates: [], skipped: [] };
};
const saveManifest = async (manifest) => {
  manifest.generatedAt = new Date().toISOString();
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
};

const loadDenials = async () => {
  try {
    const denials = JSON.parse(await readFile(DENIALS_PATH, "utf8"));
    if (Array.isArray(denials.denied)) return denials;
  } catch {
    // No denied entries yet.
  }
  return { version: 1, denied: [] };
};

await mkdir(IMAGE_ROOT, { recursive: true });
const synaxariumResponse = await fetch(SYNAXARIUM_URL);
if (!synaxariumResponse.ok) throw new Error(`Synaxarium request failed: ${synaxariumResponse.status}`);
const saints = extractSaintLabels(await synaxariumResponse.text()).slice(0, saintLimit);
const manifest = await loadManifest();
const denials = await loadDenials();
const deniedSourceKeys = new Set(denials.denied.map((entry) => entry.sourceUrl || entry.path).filter(Boolean));
const existingSourceKeys = new Set(
  manifest.candidates.flatMap((candidate) => [candidate.sourceUrl, candidate.path]).filter(Boolean),
);

const candidateCountBySaint = new Map();
for (const candidate of manifest.candidates) {
  const sourceKey = candidate.sourceUrl || candidate.path;
  if (sourceKey && deniedSourceKeys.has(sourceKey)) continue;
  const key = normalize(candidate.label);
  candidateCountBySaint.set(key, (candidateCountBySaint.get(key) || 0) + 1);
}

console.log(`Collecting up to ${candidatesPerSaint} review candidates for ${saints.length} Synaxarium saints.`);
for (const [saintIndex, label] of saints.entries()) {
  const saintKey = normalize(label);
  const currentCount = candidateCountBySaint.get(saintKey) || 0;
  const targetCount = candidatesPerSaint;
  if (currentCount >= targetCount) continue;

  const neededCandidates = targetCount - currentCount;
  process.stdout.write(`[${saintIndex + 1}/${saints.length}] ${label}... `);
  try {
    const searches = [];
    for (const [tradition, query] of [
      ["Coptic", `"${label}" Coptic icon`],
      ["Greek", `"${label}" Greek Orthodox icon`],
      ["Orthodox", `"${label}" Orthodox icon`],
    ]) {
      searches.push(...await searchCommons(label, tradition, query));
      await sleep(REQUEST_DELAY_MS);
    }
    const candidates = [...new Map(searches.filter(isReviewCandidate).map((image) => [image.title, image])).values()]
      .filter((image) => {
        const sourceKey = image.descriptionurl || image.url;
        return sourceKey && !deniedSourceKeys.has(sourceKey) && !existingSourceKeys.has(sourceKey);
      })
      .map((image) => ({ ...image, qualityScore: scoreCandidate(image, label) }))
      .sort((left, right) => right.qualityScore - left.qualityScore)
      .slice(0, neededCandidates);
    if (candidates.length === 0) throw new Error("No clear licensed icon candidate found");

    for (const [index, image] of candidates.entries()) {
      const path = await downloadCandidate(image, label, currentCount + index);
      const metadata = image.extmetadata || {};
      const sourceKey = image.descriptionurl || image.url;
      manifest.candidates.push({
        id: `${slugify(label)}-${Date.now()}-${currentCount + index + 1}`,
        label,
        tradition: image.tradition,
        qualityScore: image.qualityScore,
        path,
        sourceUrl: sourceKey,
        attribution: metadata.Artist?.value?.replace(/<[^>]*>/g, "").trim() || "Wikimedia Commons contributor",
        license: metadata.LicenseShortName?.value || "See source",
        licenseUrl: metadata.LicenseUrl?.value || "",
      });
      existingSourceKeys.add(sourceKey);
      await sleep(REQUEST_DELAY_MS);
    }
    candidateCountBySaint.set(saintKey, currentCount + candidates.length);
    await saveManifest(manifest);
    console.log(`${candidates.length} candidates ready for review`);
  } catch (error) {
    if (!error.message.includes("429")) {
      manifest.skipped.push({ label, reason: error.message });
      await saveManifest(manifest);
    }
    console.log(`deferred (${error.message})`);
    await sleep(REQUEST_DELAY_MS);
  }
}

await saveManifest(manifest);
console.log(`Done. ${manifest.candidates.length} candidates are ready for review in Images/synaxarium-icon-review-manifest.json`);
