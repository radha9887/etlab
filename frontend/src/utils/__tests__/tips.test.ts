/**
 * Tests for Tips & Best Practices Utility
 */
import { describe, it, expect } from 'vitest'
import {
  transformTips,
  sourceTips,
  sinkTips,
  actionTips,
  getTip,
  getShortTip,
  getDetailedTips,
  type NodeTip,
} from '../tips'

describe('Tips Utility', () => {
  describe('transformTips', () => {
    it('contains select tip', () => {
      expect(transformTips.select).toBeDefined()
      expect(transformTips.select.shortTip).toBeTruthy()
      expect(transformTips.select.detailedTips.length).toBeGreaterThan(0)
    })

    it('contains filter tip', () => {
      expect(transformTips.filter).toBeDefined()
      expect(transformTips.filter.shortTip).toContain('Filter')
    })

    it('contains join tip', () => {
      expect(transformTips.join).toBeDefined()
      expect(transformTips.join.shortTip).toContain('broadcast')
    })

    it('contains groupBy tip', () => {
      expect(transformTips.groupBy).toBeDefined()
      expect(transformTips.groupBy.performanceNote).toBeTruthy()
    })

    it('contains sort tip', () => {
      expect(transformTips.sort).toBeDefined()
    })

    it('contains distinct tip', () => {
      expect(transformTips.distinct).toBeDefined()
    })

    it('contains union tip', () => {
      expect(transformTips.union).toBeDefined()
      expect(transformTips.union.performanceNote).toContain('Narrow')
    })

    it('contains cache tip', () => {
      expect(transformTips.cache).toBeDefined()
      expect(transformTips.cache.commonPitfall).toBeTruthy()
    })

    it('contains repartition tip', () => {
      expect(transformTips.repartition).toBeDefined()
    })

    it('contains coalesce tip', () => {
      expect(transformTips.coalesce).toBeDefined()
    })

    it('contains broadcast tip', () => {
      expect(transformTips.broadcast).toBeDefined()
    })

    it('contains pivot tip', () => {
      expect(transformTips.pivot).toBeDefined()
    })

    it('contains explode tip', () => {
      expect(transformTips.explode).toBeDefined()
    })

    it('contains window tip', () => {
      expect(transformTips.window).toBeDefined()
    })

    it('contains all expected transform tips', () => {
      const expectedTransforms = [
        'select',
        'addColumn',
        'dropColumn',
        'rename',
        'cast',
        'flatten',
        'filter',
        'distinct',
        'dropDuplicates',
        'limit',
        'sample',
        'dropna',
        'fillna',
        'map',
        'flatMap',
        'groupBy',
        'cube',
        'rollup',
        'collectList',
        'collectSet',
        'join',
        'union',
        'intersect',
        'subtract',
        'sort',
        'sortWithinPartitions',
        'window',
        'explode',
        'pivot',
        'unpivot',
        'describe',
        'summary',
        'correlation',
        'approxQuantile',
        'cache',
        'persist',
        'checkpoint',
        'localCheckpoint',
        'unpersist',
        'repartition',
        'coalesce',
        'broadcast',
        'salt',
        'bucketing',
      ]

      expectedTransforms.forEach(transform => {
        expect(transformTips[transform]).toBeDefined()
      })
    })

    it('all transform tips have required fields', () => {
      Object.entries(transformTips).forEach(([key, tip]) => {
        expect(tip.shortTip).toBeTruthy()
        expect(Array.isArray(tip.detailedTips)).toBe(true)
        expect(tip.detailedTips.length).toBeGreaterThan(0)
      })
    })
  })

  describe('sourceTips', () => {
    it('contains csv tip', () => {
      expect(sourceTips.csv).toBeDefined()
      expect(sourceTips.csv.shortTip).toContain('schema')
    })

    it('contains parquet tip', () => {
      expect(sourceTips.parquet).toBeDefined()
      expect(sourceTips.parquet.shortTip).toContain('Columnar')
    })

    it('contains json tip', () => {
      expect(sourceTips.json).toBeDefined()
      expect(sourceTips.json.shortTip).toContain('schema')
    })

    it('contains delta tip', () => {
      expect(sourceTips.delta).toBeDefined()
      expect(sourceTips.delta.shortTip).toContain('ACID')
    })

    it('contains jdbc tip', () => {
      expect(sourceTips.jdbc).toBeDefined()
      expect(sourceTips.jdbc.shortTip).toContain('parallel')
    })

    it('all source tips have required fields', () => {
      Object.entries(sourceTips).forEach(([key, tip]) => {
        expect(tip.shortTip).toBeTruthy()
        expect(Array.isArray(tip.detailedTips)).toBe(true)
        expect(tip.detailedTips.length).toBeGreaterThan(0)
      })
    })
  })

  describe('sinkTips', () => {
    it('contains parquet tip', () => {
      expect(sinkTips.parquet).toBeDefined()
      expect(sinkTips.parquet.shortTip).toContain('Partition')
    })

    it('contains delta tip', () => {
      expect(sinkTips.delta).toBeDefined()
      expect(sinkTips.delta.shortTip).toContain('merge')
    })

    it('contains jdbc tip', () => {
      expect(sinkTips.jdbc).toBeDefined()
      expect(sinkTips.jdbc.shortTip).toContain('batch')
    })

    it('all sink tips have required fields', () => {
      Object.entries(sinkTips).forEach(([key, tip]) => {
        expect(tip.shortTip).toBeTruthy()
        expect(Array.isArray(tip.detailedTips)).toBe(true)
        expect(tip.detailedTips.length).toBeGreaterThan(0)
      })
    })
  })

  describe('actionTips', () => {
    it('contains show tip', () => {
      expect(actionTips.show).toBeDefined()
      expect(actionTips.show.shortTip).toContain('debugging')
    })

    it('contains count tip', () => {
      expect(actionTips.count).toBeDefined()
      expect(actionTips.count.performanceNote).toBeTruthy()
    })

    it('contains collect tip', () => {
      expect(actionTips.collect).toBeDefined()
      expect(actionTips.collect.shortTip).toContain('Dangerous')
    })

    it('contains printSchema tip', () => {
      expect(actionTips.printSchema).toBeDefined()
      expect(actionTips.printSchema.performanceNote).toContain('instant')
    })

    it('all action tips have required fields', () => {
      Object.entries(actionTips).forEach(([key, tip]) => {
        expect(tip.shortTip).toBeTruthy()
        expect(Array.isArray(tip.detailedTips)).toBe(true)
        expect(tip.detailedTips.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getTip', () => {
    it('returns transform tip', () => {
      const tip = getTip('transform', 'filter')
      expect(tip).toBeDefined()
      expect(tip?.shortTip).toContain('Filter')
    })

    it('returns source tip', () => {
      const tip = getTip('source', 'csv')
      expect(tip).toBeDefined()
      expect(tip?.shortTip).toBeTruthy()
    })

    it('returns sink tip', () => {
      const tip = getTip('sink', 'parquet')
      expect(tip).toBeDefined()
      expect(tip?.shortTip).toBeTruthy()
    })

    it('returns action tip', () => {
      const tip = getTip('action', 'show')
      expect(tip).toBeDefined()
      expect(tip?.shortTip).toBeTruthy()
    })

    it('returns undefined for unknown category', () => {
      const tip = getTip('unknown', 'filter')
      expect(tip).toBeUndefined()
    })

    it('returns undefined for unknown type', () => {
      const tip = getTip('transform', 'unknownTransform')
      expect(tip).toBeUndefined()
    })
  })

  describe('getShortTip', () => {
    it('returns short tip for valid transform', () => {
      const shortTip = getShortTip('transform', 'join')
      expect(shortTip).toContain('broadcast')
    })

    it('returns short tip for valid source', () => {
      const shortTip = getShortTip('source', 'parquet')
      expect(shortTip).toBeTruthy()
    })

    it('returns empty string for unknown type', () => {
      const shortTip = getShortTip('transform', 'unknownType')
      expect(shortTip).toBe('')
    })

    it('returns empty string for unknown category', () => {
      const shortTip = getShortTip('unknown', 'filter')
      expect(shortTip).toBe('')
    })
  })

  describe('getDetailedTips', () => {
    it('returns detailed tips array for valid transform', () => {
      const tips = getDetailedTips('transform', 'groupBy')
      expect(Array.isArray(tips)).toBe(true)
      expect(tips.length).toBeGreaterThan(0)
    })

    it('returns detailed tips for source', () => {
      const tips = getDetailedTips('source', 'jdbc')
      expect(Array.isArray(tips)).toBe(true)
      expect(tips.length).toBeGreaterThan(0)
    })

    it('returns empty array for unknown type', () => {
      const tips = getDetailedTips('transform', 'unknownType')
      expect(tips).toEqual([])
    })

    it('returns empty array for unknown category', () => {
      const tips = getDetailedTips('unknown', 'filter')
      expect(tips).toEqual([])
    })
  })

  describe('Tip content quality', () => {
    it('filter tip emphasizes early filtering', () => {
      const tip = transformTips.filter
      expect(tip.detailedTips.some(t => t.toLowerCase().includes('early'))).toBe(
        true
      )
    })

    it('join tip mentions shuffle', () => {
      const tip = transformTips.join
      expect(tip.detailedTips.some(t => t.toLowerCase().includes('shuffle'))).toBe(
        true
      )
    })

    it('groupBy tip mentions performance', () => {
      const tip = transformTips.groupBy
      expect(tip.performanceNote).toBeTruthy()
      expect(tip.performanceNote?.toLowerCase()).toContain('shuffle')
    })

    it('cache tip warns about unpersist', () => {
      const tip = transformTips.cache
      expect(tip.commonPitfall?.toLowerCase()).toContain('unpersist')
    })

    it('collect tip warns about OOM', () => {
      const tip = actionTips.collect
      expect(tip.shortTip.toLowerCase()).toContain('oom')
    })

    it('csv source tip mentions inferSchema', () => {
      const tip = sourceTips.csv
      expect(
        tip.detailedTips.some(t => t.toLowerCase().includes('inferschema'))
      ).toBe(true)
    })

    it('jdbc source tip mentions partitioning', () => {
      const tip = sourceTips.jdbc
      expect(tip.commonPitfall?.toLowerCase()).toContain('partition')
    })
  })

  describe('NodeTip structure', () => {
    it('has correct structure for tips with all optional fields', () => {
      const tip = transformTips.join
      expect(tip.shortTip).toBeTruthy()
      expect(tip.detailedTips).toBeTruthy()
      expect(tip.performanceNote).toBeTruthy()
      expect(tip.bestPractice).toBeTruthy()
      expect(tip.commonPitfall).toBeTruthy()
      expect(tip.relatedNodes).toBeTruthy()
    })

    it('relatedNodes array contains valid transform names', () => {
      const tip = transformTips.select
      expect(tip.relatedNodes).toBeDefined()
      tip.relatedNodes?.forEach(related => {
        expect(typeof related).toBe('string')
      })
    })

    it('cache related nodes include persist and unpersist', () => {
      const tip = transformTips.cache
      expect(tip.relatedNodes).toContain('persist')
      expect(tip.relatedNodes).toContain('unpersist')
    })
  })

  describe('Performance notes', () => {
    it('narrow transforms indicate no shuffle', () => {
      // These transforms are narrow and should indicate no shuffle
      const narrowTransforms = ['union', 'coalesce', 'sample']
      narrowTransforms.forEach(t => {
        const tip = transformTips[t]
        if (tip.performanceNote) {
          expect(
            tip.performanceNote.toLowerCase().includes('narrow') ||
              tip.performanceNote.toLowerCase().includes('no shuffle')
          ).toBe(true)
        }
      })
    })

    it('map transform warns about UDF performance', () => {
      const tip = transformTips.map
      expect(tip.performanceNote).toBeDefined()
      expect(tip.performanceNote?.toLowerCase()).toContain('udf')
    })

    it('wide transforms indicate shuffle', () => {
      const wideTransforms = ['groupBy', 'join', 'sort', 'distinct', 'repartition']
      wideTransforms.forEach(t => {
        const tip = transformTips[t]
        expect(tip.performanceNote?.toLowerCase()).toContain('shuffle')
      })
    })
  })
})
