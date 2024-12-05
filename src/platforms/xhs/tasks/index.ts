const modules = import.meta.glob('./*/index.{ts,tsx}', { eager: true, import: 'default' });

export default Object.entries(modules).map(([key, value]) => {
    const name = key.split('/')[1];
    // @ts-ignore
    value.displayName = name;
    return value;
});