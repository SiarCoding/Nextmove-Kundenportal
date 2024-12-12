import plugin from 'tailwindcss/plugin';

const tailwindPlugin = plugin(function ({ addBase }) {
  addBase({
    '.border-border': {
      'border-color': 'hsl(var(--border))',
    },
  });
});

export default tailwindPlugin;
