const { Buy, BuyItem, Delivery, Publication } = require('../db')

const fetch = require('node-fetch')

const createBuy = async (id) => {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer TEST-1978965847766511-101821-43fc6f1389c8d0df59ec6c550f6591f0-1220528859'
    }
  })
  const result = await response.json()
  const newBuy = await Buy.create({
    idBack: id,
    currency: result.currency_id,
    paymentMethod: result.payment_type_id,
    idFront: 'pago MercadoPago',
    totalAmount: result.transaction_amount,
    userId: result.additional_info.items[0].id
  })
  result.additional_info.items.map(async (p) => {
    await createBuyItem(p.quantity, p.category_id, newBuy.id)
    const publication = await Publication.findByPk(p.category_id)

    await Publication.update({ count: publication.count - p.quantity }, { where: { id: p.category_id } })
  }
  )

  await Delivery.create({
    buyId: newBuy.id
  })
  return newBuy
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
// result.additional_info.items[0].id

module.exports = { createBuy }
