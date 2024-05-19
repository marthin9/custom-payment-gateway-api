const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let payments = {};

// Models
class Payment {
    constructor(amount, currency, description) {
        this.payment_id = uuidv4();
        this.status = 'created';
        this.amount = amount;
        this.currency = currency;
        this.description = description;
    }
}

// Routes
app.post('/create-payment', (req, res) => {
    const { amount, currency, description } = req.body;
    if (!amount || !currency) {
        return res.status(400).send({ error: 'Amount and currency are required' });
    }
    const payment = new Payment(amount, currency, description);
    payments[payment.payment_id] = payment;
    res.status(201).send(payment);
});

app.post('/process-payment/:payment_id', (req, res) => {
    const { payment_id } = req.params;
    const payment = payments[payment_id];
    if (!payment) {
        return res.status(404).send({ error: 'Payment not found' });
    }
    if (payment.status !== 'created') {
        return res.status(400).send({ error: 'Payment cannot be processed' });
    }
    payment.status = 'processed';
    res.send({ payment_id: payment.payment_id, status: payment.status });
});

app.get('/payment-status/:payment_id', (req, res) => {
    const { payment_id } = req.params;
    const payment = payments[payment_id];
    if (!payment) {
        return res.status(404).send({ error: 'Payment not found' });
    }
    res.send({ payment_id: payment.payment_id, status: payment.status });
});

app.get('/', (req, res) => {
    res.send({ message: 'Welcome to the Custom Payment Gateway API' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
