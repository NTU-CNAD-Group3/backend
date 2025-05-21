import IPCIDR from 'ip-cidr';
import { Netmask } from 'netmask';

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
    const validIps = allIps.slice(1, allIps.length - 1);
    return validIps;
  }

  async isOverlap(cidr1, cidr2) {
    const block1 = new Netmask(cidr1);
    const block2 = new Netmask(cidr2);

    return (
      block1.contains(block2.base) || block1.contains(block2.broadcast) || block2.contains(block1.base) || block2.contains(block1.broadcast)
    );
  }
}

const ipUtils = new IpUtils();

export default ipUtils;
