import type { RefObject } from 'react';
import styles from './ScrollRail.module.css';

/** 2px column on the left edge. The fill is scaled imperatively by the scroll director. */
export default function ScrollRail({ fillRef }: { fillRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div aria-hidden="true" className={styles.track}>
      <div ref={fillRef} className={styles.fill} />
    </div>
  );
}
