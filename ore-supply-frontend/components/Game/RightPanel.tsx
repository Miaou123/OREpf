'use client'

import Motherlode from './Motherlode'
import Timer from './Timer'
import Stats from './Stats'
import DeploymentControls from './DeploymentControls'

export default function RightPanel() {
  return (
    <div className="space-y-6">
      <Motherlode amount={98.6} />
      <Timer />
      <Stats />
      <DeploymentControls />
    </div>
  )
}