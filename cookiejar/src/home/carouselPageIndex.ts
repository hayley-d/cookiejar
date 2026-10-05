type CarouselPageIndexInput = {
  offsetX: number;
  snapInterval: number;
  pageCount: number;
};

export function carouselPageIndex({ offsetX, snapInterval, pageCount }: CarouselPageIndexInput): number {
  if (pageCount <= 0 || snapInterval <= 0) {
    return 0;
  }
  return Math.min(pageCount - 1, Math.max(0, Math.round(offsetX / snapInterval)));
}
