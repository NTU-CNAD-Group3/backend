// 用來確認身分
export function authorize(allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' }); // 身分錯誤禁止
    }
    next();
  };
}
