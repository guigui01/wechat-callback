import { createClient } from '@supabase/supabase-js';

// 替换成你自己的 Supabase 信息
const SUPABASE_URL = '你的Project URL';
const SUPABASE_KEY = '你的service_role secret';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 简单的密钥验证（防止恶意请求，对话流里也要加这个密钥）
const AUTH_TOKEN = 'wechat_charity_2026';

export default async function handler(req, res) {
    // 1. 验证请求方法（只允许POST）
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. 验证密钥（安全）
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 3. 接收微信对话开放平台发来的数据
        const data = req.body;
        console.log('收到数据:', data);

        // 4. 存入 Supabase 数据库
        const { error } = await supabase
            .from('charity_records')
            .insert([
                {
                    openid: data.openid,
                    user_name: data.user_name,
                    phone: data.phone,
                    charity_activity: data.charity_activity,
                    activity_time: data.activity_time,
                    city: data.city
                }
            ]);

        if (error) throw error;

        // 5. 返回成功给微信平台
        res.status(200).json({ status: 'success', message: '数据已保存' });
    } catch (error) {
        console.error('错误:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}