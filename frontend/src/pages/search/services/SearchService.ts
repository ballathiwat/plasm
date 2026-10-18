// ============================================================
//  src/pages/search/services/SearchService.ts
// ============================================================

import apiAdapter from '../../../helpers/http/apiAdapter'
import { GET_UNIT_SEARCH } from '../../../helpers/url_helper'
import type { SearchUnitResult } from './SearchType'

const searchService = {
  /** GET /units/search?q= */
  searchUnits: async (query: string): Promise<SearchUnitResult[]> => {
    return await apiAdapter.get<SearchUnitResult[]>(GET_UNIT_SEARCH, { q: query })
  },
}

export default searchService