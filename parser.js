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

  // for claude
  {
    // copy the openai proxy group as the claude proxy group
    {
      const openaiProxyGroup = obj["proxy-groups"]?.find((proxy_group) =>
        proxy_group.name.toLowerCase().includes("openai")
      );

      if (openaiProxyGroup) {
        const claudeProxyGroup = {
          name: "Claude",
          type: "select",
          proxies: openaiProxyGroup.proxies,
        };

        // put the claude proxy group after the openai proxy group
        const index = obj["proxy-groups"].indexOf(openaiProxyGroup);
        obj["proxy-groups"].splice(index + 1, 0, claudeProxyGroup);
      }
    }

    // add claude rules
    {
      let rules = obj["rules"]; // [String, String, ...]
      let claudeRules = [
        "DOMAIN-SUFFIX,claude.ai,Claude",
        "DOMAIN-SUFFIX,anthropic.com,Claude",
      ];
      // add claudeRules to the openai rules after the rules
      let index = rules.findIndex((rule) =>
        rule.toLowerCase().includes("openai")
      );
      if (index !== -1) {
        rules.splice(index + 1, 0, ...claudeRules);
      } else {
        rules.push(...claudeRules);
      }
      obj["rules"] = rules;
    }
  }

  return yaml.stringify(obj);
};
