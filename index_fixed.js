const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOP = process.env.SHOP;
const PAYMENT_API_KEY = process.env.API_KEY;
const PAYMENT_PROJECT_ID = process.env.PROJECT_ID;
const PAYMENT_SECRET_KEY = process.env.SECRET_KEY;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/pay', (req, res) => {
    const { order_id, amount } = req.query;

    // Здесь ты можешь подставить данные для генерации HPP-ссылки
    const paymentLink = `https://globalpaytech.com/hpp?order_id=${order_id}&amount=${amount}&project_id=${PAYMENT_PROJECT_ID}&key=${PAYMENT_API_KEY}&return_url=https://globalpaytech-hpp.onrender.com/success`;

    res.send(`
        <h1>Оплатите заказ №${order_id} на сумму $${amount}</h1>
        <a href="${paymentLink}"><button>Перейти к оплате</button></a>
    `);
});

app.get('/success', async (req, res) => {
    const { order_id, status } = req.query;

    if (status === 'success') {
        try {
            await axios.put(`https://${SHOP}/admin/api/2023-04/orders/${order_id}.json`, {
                order: {
                    id: order_id,
                    financial_status: "paid"
                }
            }, {
                headers: {
                    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            });

            res.send('✅ Оплата успешна. Статус заказа обновлён в Shopify.');
        } catch (e) {
            console.error(e.response?.data || e.message);
            res.send('⚠️ Ошибка при обновлении заказа в Shopify.');
        }
    } else {
        res.send('❌ Платёж не прошёл.');
    }
});

app.listen(port, () => {
    console.log(`✅ Сервер запущен на порту ${port}`);
});
