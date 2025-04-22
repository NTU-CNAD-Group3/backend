import IPCIDR from 'ip-cidr';
class IpUtils {
  // 在網段抓取可用IP
  async getAvailableIp(cidrStr, usedIps = []) {
    if (!cidrStr || !IPCIDR.isValidCIDR(cidrStr)) {
      throw new Error(`Invalid CIDR format: ${cidrStr}`);
    }
    const cidr = new IPCIDR(cidrStr);
    const allIps = cidr.toArray();
    const validIps = allIps.slice(1, allIps.length - 1);

    for (const ipAddr of validIps) {
      if (!usedIps.includes(ipAddr)) return ipAddr;
    }
    return null;
  }

  async getAllIP(cidrStr) {
    if (!cidrStr || !IPCIDR.isValidCIDR(cidrStr)) {
      throw new Error(`Invalid CIDR format: ${cidrStr}`);
    }
    const cidr = new IPCIDR(cidrStr);
    const allIps = cidr.toArray();
    return allIps;
  }
}

const ipUtils = new IpUtils();

export default ipUtils;
