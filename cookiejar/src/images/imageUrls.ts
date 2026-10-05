const imageUrlPrefix = 'https://';

export function isPreviewableImageUrl(imageUrl: string) {
  const trimmedImageUrl = imageUrl.trim();
  return (
    trimmedImageUrl.length > imageUrlPrefix.length && trimmedImageUrl.toLowerCase().startsWith(imageUrlPrefix)
  );
}

export function imageUrlToStore(imageUrl: string) {
  const trimmedImageUrl = imageUrl.trim();
  return trimmedImageUrl.length === 0 ? null : trimmedImageUrl;
}

export function imageUrlError(imageUrl: string) {
  if (imageUrlToStore(imageUrl) !== null && !isPreviewableImageUrl(imageUrl)) {
    return 'Image URL must start with https://';
  }
  return null;
}
