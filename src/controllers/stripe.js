const { Buy, BuyItem, Delivery, Publication } = require('../db')
const Stripe = require('stripe')
// const BuyItem = require('../models/BuyItem')
// const Publication = require('../models/Publication')
// const User = require('../models/User')

/* const { STRIPE_KEY } = process.env */
const stripe = new Stripe('sk_test_51LulbPIqj2ZSlvPhpV2QZCrTWzkzSK0QG2kZLrWHuL4gUTklxTGDoP2CIv6BbEfPPgUEANVtmmdBZZyfbY4ClW9p00o6CENx3K')

const createBuy = async ({ idStripe, totalAmount, carrito, userId }) => {
  try {
    // console.log('Este es el idStripe', idStripe)
    const payment = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'ARS',
      description: 'Prueba',
      payment_method: idStripe,
      confirm: true
    })
    console.log('Este es el payment', payment)
    if (!payment.hasOwnProperty('id')) throw new Error(payment.raw.message) //eslint-disable-line
    const newBuy = await Buy.create({
      idBack: payment.id,
      currency: payment.currency,
      paymentMethod: payment.payment_method_types.toString(),
      idFront: idStripe,
      totalAmount,
      userId
    })
    // console.log('Esta es la nueva compra', newBuy)
    carrito?.map(async (p) => {
      await createBuyItem(p.count, p.id, newBuy.id)

      const publication = await Publication.findByPk(p.id)

      await Publication.update({ count: publication.count - p.count }, { where: { id: p.id } })
    })

    await Delivery.create({
      buyId: newBuy.id
    })

    return newBuy
  } catch (error) {
    console.log(error, 'Error createBuy stripe')
    throw new Error(error.raw.message)
  }
}
const createBuyItem = async (countProduct, publicationId, buyId) => {
  try {
    const newBuyItem = await BuyItem.create({
      countProduct,
      publicationId,
      buyId
    })
    console.log('Este es el newBuyItem', newBuyItem)
    return newBuyItem
  } catch (error) {
    return new Error('Error en la creación del BuyItem')
  }
}

module.exports = {
  createBuy,
  createBuyItem
}
