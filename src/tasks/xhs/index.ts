const modules: Record<string, React.FunctionComponent> = import.meta.glob('./*/index.{ts,tsx}', { eager: true, import: 'default' });

export default Object.entries(modules).map(([key, value]) => {
    const name = key.split('/').reverse()[1];
    value.displayName = name;
    return value;
});