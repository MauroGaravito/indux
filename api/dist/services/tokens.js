import jwt from 'jsonwebtoken';
export function signAccessToken(user) {
    const expiresIn = (process.env.ACCESS_TOKEN_TTL || '15m');
    const secret = (process.env.JWT_ACCESS_SECRET || 'devaccesssecretchangeme');
    return jwt.sign({ sub: user._id, role: user.role }, secret, { expiresIn });
}
export function signRefreshToken(user) {
    const expiresIn = (process.env.REFRESH_TOKEN_TTL || '7d');
    const secret = (process.env.JWT_REFRESH_SECRET || 'devrefreshsecretchangeme');
    return jwt.sign({ sub: user._id, role: user.role }, secret, { expiresIn });
}
export function verifyRefreshToken(token) {
    const secret = (process.env.JWT_REFRESH_SECRET || 'devrefreshsecretchangeme');
    return jwt.verify(token, secret);
}
