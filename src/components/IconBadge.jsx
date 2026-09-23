import Icon from './Icon.jsx';

export default function IconBadge({ name, size = 48, tintVar }) {
  const style = { width: size, height: size };
  if (tintVar) {
    style.background = `color-mix(in srgb, var(${tintVar}) 14%, white)`;
    style.color = `var(${tintVar})`;
  }
  return (
    <div className="icon-badge" style={style}>
      <Icon name={name} size={Math.round(size * 0.5)} />
    </div>
  );
}
