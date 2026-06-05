export const saleStatusMap = {
  available: '판매중',
  reserved: '거래중',
  sold: '거래완료',
}

export function mapProduct(p) {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    isFree: p.isFree,
    image: p.thumbnailUrl || `https://picsum.photos/seed/${p.id}/400/300`,
    status: saleStatusMap[p.saleStatus] ?? p.saleStatus,
    views: p.viewCount ?? 0,
  }
}
