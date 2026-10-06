const { withEntitlementsPlist } = require('expo/config-plugins');

function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (entitlementsConfig) => {
    delete entitlementsConfig.modResults['aps-environment'];
    return entitlementsConfig;
  });
}

module.exports = withoutPushEntitlement;
