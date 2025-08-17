// src/_metronic/helpers/KTSVG.tsx

import React from 'react'

type Props = {
  className?: string
  path: string
}

const KTSVG: React.FC<Props> = ({className = '', path}) => {
  return (
    <span className={`svg-icon ${className}`}>
      <img src={path} alt="svg icon" />
    </span>
  )
}

export {KTSVG}
