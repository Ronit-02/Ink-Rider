const { getCapabilities } = require('../services/entitlement.service');

const getMyEntitlements = async (req, res) => {
  try {
    return res.status(200).json({ data: await getCapabilities(req.auth.userId) });
  } catch (error) {
    console.error(`[${req.requestId}] Entitlement lookup failed`);
    return res.status(500).json({ message: 'Unable to load membership access' });
  }
};

module.exports = { getMyEntitlements };
