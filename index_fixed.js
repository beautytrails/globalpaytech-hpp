const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

const SHOPIFY_ACCESS_TOKEN = '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';
const SHOP = 'beautytrailsss.myshopify.com';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/pay', (req, res) => {
    const { order_id, amount } = req.query;

    const paymentLink = `https://globalpaytech-hpp.onrender.com/success?order_id=${order_id}&status=success`;

    res.send(\`
        <h1>Оплатите заказ №\${order_id} на сумму $\${amount}</h1>
        <a href="\${paymentLink}"><button>Перейти к оплате</button></a>
    \`);
});

app.get('/success', async (req, res) => {
    const { order_id, status } = req.query;

    if (status === 'success') {
        try {
            await axios.put(\`https://\${SHOP}/admin/api/2023-04/orders/\${order_id}.json\`, {
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

            res.send('✅ Оплата успешна. Статус заказа обновлён.');
        } catch (e) {
            console.error(e);
            res.send('⚠️ Ошибка обновления заказа в Shopify.');
        }
    } else {
        res.send('❌ Платёж не прошёл.');
    }
});

app.listen(port, () => {
    console.log(`HPP сервер запущен на порту ${port}`);
});