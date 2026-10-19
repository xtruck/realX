// S13d: a small luminance sample of the user's PHOTO (an <img> the user chose), for the photo-quality advice.
// This file takes an image element and nothing else: it never sees the camera or the video. The caller flags the read
// (setReading) so the privacy tests can tell this one allowed read of the photo from any read of the camera.

export function photoLuminance(image, setReading = () => {}, maxSide = 640) {
  const iw = image && (image.naturalWidth || image.width), ih = image && (image.naturalHeight || image.height);
  if (!(iw > 0) || !(ih > 0)) return null;
  setReading(true);
  try {
    const k = Math.min(1, maxSide / Math.max(iw, ih));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(iw * k)); c.height = Math.max(1, Math.round(ih * k));
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(image, 0, 0, c.width, c.height);
    const px = g.getImageData(0, 0, c.width, c.height).data;
    const data = new Uint8Array(c.width * c.height);
    for (let i = 0; i < data.length; i++) data[i] = Math.round(0.299 * px[4 * i] + 0.587 * px[4 * i + 1] + 0.114 * px[4 * i + 2]);
    return { width: c.width, height: c.height, data };
  } catch (err) {
    return null;
  } finally { setReading(false); }
}
