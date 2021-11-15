import express from 'express'
import { User } from '../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Config } from '../../express/lesson1/config'
import HttpException from '../../exceptions/HttpException'

export const authRouter = express.Router()

authRouter.post('/register', async (req, res, next) => {
  const data = req.body
  let user = await User.findOne({ where: { userName: data.userName } })
  if (!user) {
    user = new User()
    user.userName = data.userName
    user.password = bcrypt.hashSync(data.password, 10)
    await user.save()
    res.json(user)
  } else {
    next(
      new HttpException(
        422, 
        `User with given name "${data.userName}" already exists`
      ))
  }
})
authRouter.post('/login', async (req, res, next) => {
  // try {
  //   const data = req.body
  //   const user = await User.findOneOrFail({
  //     where: { userName: data.userName },
  //   })
  //   if (bcrypt.compareSync(data.password, user.password)) {
  //     const out: any = Object.assign({}, user)
  //     delete out.password
  //     out.token = jwt.sign(out, Config.secretKey, { expiresIn: '30 days' })
  //     res.json(out)
  //   }
  //   throw new Error('wrong user name or password')
  // } catch (e: any) {
  //   res.status(e.code || 500)
  //   res.json({ error: e.message })
  // }
  try {
    const data = req.body
    const user = await User.findOneOrFail({
      where: { userName: data.userName },
    })
    if (bcrypt.compareSync(data.password, user.password)) {
      const out: any = Object.assign({}, user)
      delete out.password
      out.token = jwt.sign(out, Config.secretKey, { expiresIn: '30 days' })
      res.json(out)
    } else {
      next(new HttpException(401, 'Wrong user name or password'))
    }
  } catch {
    next(new HttpException(401, 'Wrong user name or password'))
  }
})
