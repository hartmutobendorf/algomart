import { Model } from 'objection'
import { DirectusPackTemplate } from '@algomart/schemas'

export class CMSCachePackTemplateModel extends Model {
  static tableName = 'CmsCachePackTemplates'

  id!: string
  slug!: string
  type!: string
  content!: string
  releasedAt!: string | null
  auctionUntil!: string | null
  createdAt!: string
  updatedAt!: string

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString()
  }

  static async insert(packTemplate: DirectusPackTemplate) {
    await CMSCachePackTemplateModel.query().insert({
      id: packTemplate.id,
      slug: packTemplate.slug,
      type: packTemplate.type,
      releasedAt: packTemplate.released_at,
      auctionUntil: packTemplate.auction_until,
      content: JSON.stringify(packTemplate),
    })

    return packTemplate
  }

  static async update(packTemplate: DirectusPackTemplate) {
    await CMSCachePackTemplateModel.query()
      .where({ id: packTemplate.id })
      .update({ content: JSON.stringify(packTemplate) })

    return packTemplate
  }

  static async upsert(packTemplate: DirectusPackTemplate) {
    const record = await this.getById(packTemplate.id)
    if (record) {
      this.update(packTemplate)
    } else {
      this.insert(packTemplate)
    }

    return packTemplate
  }

  static async getById(id: string) {
    return await CMSCachePackTemplateModel.query().findOne('id', id)
  }
}
