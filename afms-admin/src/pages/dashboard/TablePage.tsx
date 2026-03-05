import { type ReactNode } from 'react'

type TablePageProps = {
  title: string
  controls: ReactNode
  table: ReactNode
}

function TablePage ({ title, controls, table }: TablePageProps) {
  return (
    <section className='panel'>
      <h3>{title}</h3>
      <div className='filter-bar'>{controls}</div>
      <div className='table-wrap'>{table}</div>
    </section>
  )
}

export default TablePage
