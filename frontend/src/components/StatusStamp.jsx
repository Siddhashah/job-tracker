const CONFIG = {
  Applied: { label: 'dispatched', color: 'route' },
  Interview: { label: 'in transit', color: 'transit' },
  Offer: { label: 'delivered', color: 'delivered' },
  Rejected: { label: 'returned', color: 'returned' },
};

const COLOR_CLASSES = {
  route: 'border-route text-route',
  transit: 'border-transit text-transit',
  delivered: 'border-delivered text-delivered',
  returned: 'border-returned text-returned',
};

export default function StatusStamp({ status }) {
  const s = CONFIG[status] || CONFIG.Applied;
  return (
    <div
      className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed -rotate-6 font-display text-[10px] uppercase tracking-wide text-center leading-tight select-none ${COLOR_CLASSES[s.color]}`}
    >
      {s.label}
    </div>
  );
}