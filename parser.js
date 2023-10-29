module.exports.parse = async (
  raw,
  { axios, yaml, notify, console },
  { name, url, interval, selected }
) => {
  const obj = yaml.parse(raw);

  // add all nodes to openai proxy group
  {
    const openaiProxyGroup = obj["proxy-groups"]?.find((proxy_group) =>
      proxy_group.name.toLowerCase().includes("openai")
    );

    if (openaiProxyGroup) {
      const openaiProxies = new Set(openaiProxyGroup.proxies);
      const newProxies = obj.proxies
        .map((proxy) => proxy.name)
        .filter((node) => !openaiProxies.has(node));

      openaiProxyGroup.proxies.push(...newProxies);
    }
  }

  return yaml.stringify(obj);
};
