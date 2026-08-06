import { useId, useState } from 'react';
import { motion } from 'motion/react';
import ConstellationMap from '../components/ConstellationMap';
import Decode from '../components/Decode';
import SplitReveal from '../components/SplitReveal';
import { INVITE } from '../config';
import { MAPS } from '../lib/constellations';
import { rise, settle } from '../lib/motion';
import { waLink } from '../lib/whatsapp';
import { useSky } from '../sky/SkyProvider';
import shared from './section.module.css';
import styles from './Summons.module.css';

type Attendance = '' | 'in' | 'out';
type Plate = '' | 'veg' | 'non-veg';

const ERR_NAME = "Add your name so we know who's stepping through.";
const ERR_ATT = 'Tell us — are you in?';
const ERR_FOOD = 'Veg or non-veg — the biryani needs a count.';

interface Props {
  sectionRef(el: HTMLElement | null): void;
  revealed: boolean;
  submitted: boolean;
  onSubmitted(): void;
  onEdit(): void;
}

interface OptionProps {
  label: string;
  selected: boolean;
  accent?: 'flare';
  onSelect(): void;
}

function Option({ label, selected, accent, onSelect }: OptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-accent={accent}
      className={styles.option}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}

function buildMessage(
  name: string,
  att: Attendance,
  guests: number,
  food: Plate,
  note: string,
): string {
  const lines = [
    "✦ RSVP · YASHIKA'S 23RD · THE LION'S PORTAL ✦",
    `Name: ${name}`,
    `Status: ${att === 'in' ? "I'M IN ✦" : "CAN'T MAKE IT"}`,
  ];
  if (att === 'in') {
    lines.push(`Bringing: ${guests === 0 ? 'just me' : `+${guests}`}`);
    lines.push(`Plate: ${food.toUpperCase()}`);
  }
  if (note) lines.push(`Note: ${note}`);
  return lines.join('\n');
}

export default function Summons({ sectionRef, revealed, submitted, onSubmitted, onEdit }: Props) {
  const sky = useSky();
  const uid = useId();
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [att, setAtt] = useState<Attendance>('');
  const [guests, setGuests] = useState(0);
  const [food, setFood] = useState<Plate>('');
  const [error, setError] = useState('');

  const state = revealed ? 'shown' : 'hidden';
  const direct = waLink(INVITE.whatsappNumber);
  // The extra fields stay up until someone actively says they can't make it.
  const isIn = att !== 'out';

  const submit = () => {
    const trimmedName = name.trim();
    const trimmedNote = note.trim();
    if (!trimmedName) return setError(ERR_NAME);
    if (!att) return setError(ERR_ATT);
    if (att === 'in' && !food) return setError(ERR_FOOD);

    const body = buildMessage(trimmedName, att, guests, food, trimmedNote);
    window.open(waLink(INVITE.whatsappNumber, body), '_blank');
    sky.bloom(0.5, 0.5, 1800);
    setError('');
    onSubmitted();
  };

  return (
    <section ref={sectionRef} className={`${shared.section} ${styles.summons}`}>
      <ConstellationMap config={MAPS.cb} revealed={revealed} />

      <div className={shared.inner}>
        <motion.div
          className={shared.centered}
          variants={rise}
          initial="hidden"
          animate={state}
          transition={settle(0.9)}
        >
          <Decode text="✦ THE SUMMONS" active={revealed} className={`${shared.kicker} anim-breathe-5`} />
          <h2 className={`${shared.h2} ${styles.h2}`}>
            <SplitReveal text="Say you'll step through" revealed={revealed} />
          </h2>
          <p className={`${shared.sub} ${styles.sub}`}>one tap — your RSVP lands on WhatsApp</p>
        </motion.div>

        {submitted ? (
          <div className={styles.success}>
            <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
              <circle
                cx={40}
                cy={40}
                r={34}
                fill="none"
                strokeWidth={2}
                pathLength={1}
                strokeDasharray={1}
                className={`${styles.ring} anim-draw-ring`}
              />
              <path
                d="M26,41 L36,51 L55,31"
                fill="none"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                className={`${styles.tick} anim-draw-tick`}
              />
            </svg>
            <p className={styles.successTitle}>You&apos;re on the list.</p>
            <p className={`${styles.successNote} anim-breathe-4`}>SEE YOU ON THE OTHER SIDE ✦</p>
            <p className={styles.fallback}>
              if WhatsApp didn&apos;t open, message us directly at
              <br />
              <a href={direct} target="_blank" rel="noopener">
                {INVITE.whatsappDisplay}
              </a>
            </p>
            <button type="button" onClick={onEdit} className={styles.edit}>
              EDIT RESPONSE
            </button>
          </div>
        ) : (
          <motion.div
            className={styles.card}
            variants={rise}
            initial="hidden"
            animate={state}
            transition={settle(0.9, 0.15)}
          >
            <label htmlFor={`${uid}-name`} className={styles.label}>
              YOUR NAME
            </label>
            <input
              id={`${uid}-name`}
              type="text"
              autoComplete="name"
              placeholder="who's stepping through?"
              className={styles.input}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
            />

            <p id={`${uid}-att`} className={styles.label}>
              ARE YOU IN?
            </p>
            <div role="group" aria-labelledby={`${uid}-att`} className={styles.options}>
              <Option
                label="I'M IN ✦"
                selected={att === 'in'}
                onSelect={() => {
                  setAtt('in');
                  setError('');
                }}
              />
              <Option
                label="CAN'T MAKE IT"
                selected={att === 'out'}
                accent="flare"
                onSelect={() => {
                  setAtt('out');
                  setError('');
                }}
              />
            </div>

            {isIn && (
              <>
                <p id={`${uid}-guests`} className={styles.label}>
                  BRINGING ANYONE?
                </p>
                <div role="group" aria-labelledby={`${uid}-guests`} className={styles.options}>
                  {[0, 1, 2].map((n) => (
                    <Option
                      key={n}
                      label={n === 0 ? 'JUST ME' : `+${n}`}
                      selected={guests === n}
                      onSelect={() => {
                        setGuests(n);
                        setError('');
                      }}
                    />
                  ))}
                </div>

                <p id={`${uid}-plate`} className={styles.label}>
                  YOUR PLATE
                </p>
                <div role="group" aria-labelledby={`${uid}-plate`} className={styles.options}>
                  <Option
                    label="VEG"
                    selected={food === 'veg'}
                    onSelect={() => {
                      setFood('veg');
                      setError('');
                    }}
                  />
                  <Option
                    label="NON-VEG"
                    selected={food === 'non-veg'}
                    onSelect={() => {
                      setFood('non-veg');
                      setError('');
                    }}
                  />
                </div>
              </>
            )}

            <label htmlFor={`${uid}-note`} className={styles.label}>
              ANYTHING WE SHOULD KNOW? <span className={styles.optional}>(OPTIONAL)</span>
            </label>
            <textarea
              id={`${uid}-note`}
              rows={2}
              placeholder="allergies, song requests, dramatic entrances…"
              className={styles.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <p aria-live="polite" className={styles.error} data-visible={error ? '' : undefined}>
              {error}
            </p>

            <button type="button" onClick={submit} className={styles.submit}>
              ENTER THE PORTAL
            </button>
            <p className={styles.hint}>
              opens WhatsApp with your reply pre-written — just press send
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
