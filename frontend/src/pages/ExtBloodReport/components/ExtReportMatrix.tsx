// frontend/src/pages/ExtBloodReport/components/ExtReportMatrix.tsx
import type { ExtReportMatrixRow } from '../services/ExtReportType'
const BG = ['A+','A-','B+','B-','O+','O-','AB+','AB-']
export default function ExtReportMatrix({ data }: { data: ExtReportMatrixRow[] }) {
  return (
    <div className="ext-report-card"><h4 className="ext-report-card-title">Matrix ชนิดเลือด × หมู่เลือด</h4>
      <div style={{ overflowX: 'auto' }}><table className="ext-matrix-table"><thead><tr><th>ชนิด</th>{BG.map(g => <th key={g}>{g}</th>)}<th>รวม</th></tr></thead>
        <tbody>{data.map(r => <tr key={r.productCode}><td className="ext-matrix-product">{r.productCode}</td>{BG.map(g => <td key={g} className="ext-matrix-cell">{r.groups[g] || 0}</td>)}<td className="ext-matrix-total">{r.total}</td></tr>)}</tbody>
      </table></div>
    </div>
  )
}
