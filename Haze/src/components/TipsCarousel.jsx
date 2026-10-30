import { useEffect, useState } from 'react'

// This constant sets how often the carousel advances automatically.
const SLIDE_INTERVAL_MS = 3000

// These slides share the four practical tips already shown on the page.
const slides = [
  {
    title: 'Check before heading out',
    text: 'Follow current local readings and official advisories; reduce or reschedule strenuous outdoor activity when air quality is poor.',
    image: '/images/haze-1.jpg',
  },
  {
    title: 'Limit indoor smoke',
    text: 'Keep windows and doors closed during smoky periods, and use a suitable air purifier if available.',
    image: '/images/haze-2.jpg',
  },
  {
    title: 'Protect yourself outdoors',
    text: 'If you must be outside in heavy haze, a well-fitted particulate respirator can help reduce exposure; fit matters.',
    image: '/images/haze-3.jpg',
  },
  {
    title: 'Pay attention to symptoms',
    text: 'Move to cleaner air if you feel unwell. Seek medical advice for breathing difficulty or symptoms that persist, especially for children, older adults, and people with heart or lung conditions.',
    image: '/images/haze-4.jpg',
  },
]

// This carousel shows one practical safety tip at a time.
export function TipsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [timerReset, setTimerReset] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const isPaused = isHovered || isFocused
  const activeSlide = slides[activeIndex]

  // This effect advances the carousel and resets its timer when the slide changes.
  useEffect(() => {
    if (isPaused) return undefined

    const interval = window.setInterval(() => {
      setIsVisible(false)
      setActiveIndex((index) => (index + 1) % slides.length)
      setTimerReset((reset) => reset + 1)
    }, SLIDE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [activeIndex, isPaused, timerReset])

  // This effect fades the new slide into view after its content changes.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [activeIndex, timerReset])

  function changeSlide(getNextIndex) {
    setIsVisible(false)
    setActiveIndex(getNextIndex)
    setTimerReset((reset) => reset + 1)
  }

  function showPrevious() {
    changeSlide((index) => (index - 1 + slides.length) % slides.length)
  }

  function showNext() {
    changeSlide((index) => (index + 1) % slides.length)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPrevious()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNext()
    }
  }

  return (
    <section
      className="tips-carousel relative h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-800 shadow-sm sm:h-[360px]"
      aria-label="Practical safety tips"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false)
      }}
      onKeyDown={handleKeyDown}
    >
      <img
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        src={activeSlide.image}
        alt=""
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" aria-hidden="true" />

      <div className={`tips-carousel-copy absolute inset-x-12 top-1/2 -translate-y-1/2 sm:inset-x-20 ${isVisible ? 'is-visible' : ''}`} aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">Practical safety tips</p>
        <h2 className="tips-text-shadow mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {activeSlide.title}
        </h2>
        <p className="tips-text-shadow mt-3 max-w-2xl text-sm leading-6 text-white sm:text-base sm:leading-7">
          {activeSlide.text}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-circle absolute left-3 top-1/2 -translate-y-1/2 border-white/40 bg-black/35 text-white hover:border-white/60 hover:bg-black/60 sm:left-5"
        aria-label="Previous safety tip"
        onClick={showPrevious}
      >
        <span aria-hidden="true">‹</span>
      </button>
      <button
        type="button"
        className="btn btn-circle absolute right-3 top-1/2 -translate-y-1/2 border-white/40 bg-black/35 text-white hover:border-white/60 hover:bg-black/60 sm:right-5"
        aria-label="Next safety tip"
        onClick={showNext}
      >
        <span aria-hidden="true">›</span>
      </button>

      <div className="absolute inset-x-0 bottom-14 flex justify-center gap-2" role="group" aria-label="Choose a safety tip">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={`h-2.5 w-2.5 rounded-full border border-white/80 transition-colors ${index === activeIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/70'}`}
            aria-label={`Show tip ${index + 1}: ${slide.title}`}
            aria-pressed={index === activeIndex}
            onClick={() => changeSlide(() => index)}
          />
        ))}
      </div>

      <p className="tips-text-shadow absolute inset-x-4 bottom-3 text-center text-[11px] leading-4 text-white/85 sm:text-xs">
        This is general guidance, not medical advice. This page uses modelled air-quality estimates; check official local advisories for decisions.
      </p>
    </section>
  )
}
