// ============================================
// Tutorial Mascot — CSS-only Animated Owl
// ============================================

import type { MascotPose } from './tutorialSteps';

interface TutorialMascotProps {
  pose: MascotPose;
  style?: React.CSSProperties;
}

export function TutorialMascot({ pose, style }: TutorialMascotProps) {
  return (
    <div className="tutorial-mascot" style={style}>
      <div className={`mascot-container ${pose}`}>
        {/* Ear Tufts */}
        <div className="mascot-tufts">
          <div className="mascot-tuft" />
          <div className="mascot-tuft" />
        </div>

        {/* Body */}
        <div className="mascot-body">
          {/* Eyes */}
          <div className="mascot-eyes">
            <div className="mascot-eye">
              <div className="mascot-pupil">
                <div className="mascot-pupil-shine" />
              </div>
            </div>
            <div className="mascot-eye">
              <div className="mascot-pupil">
                <div className="mascot-pupil-shine" />
              </div>
            </div>
          </div>

          {/* Beak */}
          <div className="mascot-beak" />

          {/* Belly */}
          <div className="mascot-belly" />

          {/* Wings */}
          <div className="mascot-wing-left" />
          <div className="mascot-wing-right" />
        </div>

        {/* Feet */}
        <div className="mascot-feet">
          <div className="mascot-foot" />
          <div className="mascot-foot" />
        </div>
      </div>
    </div>
  );
}
