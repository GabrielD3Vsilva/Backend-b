const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.warn('[AUTH] Token não fornecido (401).');
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.warn('[AUTH] Token inválido ou expirado (403). Erro:', err.message);
            return res.status(403).json({ message: 'Token de autenticação inválido ou expirado.' });
        }
        req.user = user;
        // ** DEBUG: Veja o payload do token aqui **
        console.log('[AUTH] Token verificado. Payload do usuário:', req.user);
        next();
    });
};


const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user || !req.user.role) {
            console.warn('[AUTHORIZE] Acesso negado: Informações de função não encontradas em req.user.');
            return res.status(403).json({ message: 'Acesso negado. Informações de função não encontradas.' });
        }

        const rolesArray = [...allowedRoles];
        const userRoleFromToken = req.user.role; // Captura a role do usuário

        // ** DEBUG: Logs detalhados para comparação de roles **
        console.log('\n--- DEBUG DE AUTORIZAÇÃO ---');
        console.log('[AUTHORIZE] Roles permitidas para esta rota:', JSON.stringify(rolesArray));
        console.log(`[AUTHORIZE] Role do usuário do token: "${userRoleFromToken}"`);
        console.log(`[AUTHORIZE] Tipo da role do usuário: ${typeof userRoleFromToken}`);
        console.log(`[AUTHORIZE] Role do usuário TRATADA (com .trim()): "${String(userRoleFromToken).trim()}"`);
        console.log(`[AUTHORIZE] Roles permitidas (como array original):`, rolesArray); // Para inspecionar o array real

        const hasPermission = rolesArray.includes(userRoleFromToken);
        const hasPermissionTrimmed = rolesArray.includes(String(userRoleFromToken).trim());


        console.log(`[AUTHORIZE] Resultado 'includes' (sem trim): ${hasPermission}`);
        console.log(`[AUTHORIZE] Resultado 'includes' (com trim): ${hasPermissionTrimmed}`);
        console.log('--- FIM DEBUG DE AUTORIZAÇÃO ---\n');

        // Use a role tratada para a verificação final
        if (rolesArray.includes(String(userRoleFromToken).trim())) {
            next();
        } else {
            console.warn(`[AUTHORIZE] Acesso negado: Role "${userRoleFromToken}" não permitida para esta ação.`);
            return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
        }
    };
};


module.exports = { authenticateToken, authorizeRoles };