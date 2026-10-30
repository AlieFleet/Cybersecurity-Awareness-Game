import { useState } from 'react'

// These questions teach practical facts about haze and air quality.
const questions = [
  {
    question: 'What is haze most commonly made of?',
    options: ['Water vapour only', 'Tiny particles and pollutants suspended in air', 'Oxygen released by plants', 'Dust from outer space'],
    answer: 1,
    explanation: 'Haze contains fine particles and other pollutants that reduce visibility and can affect health.',
    tip: 'Think of haze as a mixture in the air, not a single gas or a harmless cloud.',
  },
  {
    question: 'Which particle size can travel deepest into the lungs?',
    options: ['PM2.5', 'PM25', 'PM100', 'Pollen only'],
    answer: 0,
    explanation: 'PM2.5 particles are small enough to travel deep into the lungs.',
    tip: 'The smaller the particle, the farther it can travel into the respiratory system.',
  },
  {
    question: 'What should you check before strenuous outdoor activity?',
    options: ['The moon phase', 'The latest air-quality reading and official advisories', 'A week-old forecast only', 'The colour of your shoes'],
    answer: 1,
    explanation: 'Current readings and official local advisories help you decide whether to reduce or reschedule exertion.',
    tip: 'Use current local information rather than guessing from how the sky looks.',
  },
  {
    question: 'What is a sensible step during a smoky period?',
    options: ['Keep windows open all day', 'Burn incense to cover the smell', 'Keep windows and doors closed', 'Exercise beside a busy road'],
    answer: 2,
    explanation: 'Closing windows and doors can help limit outdoor smoke entering your home.',
    tip: 'Reduce the path for smoky outdoor air to get indoors.',
  },
  {
    question: 'Who may be more affected by poor air quality?',
    options: ['Only professional athletes', 'Children, older adults, and people with heart or lung conditions', 'Only people who work outdoors', 'Nobody if they drink water'],
    answer: 1,
    explanation: 'Children, older adults, and people with heart or lung conditions may be more sensitive to air pollution.',
    tip: 'Consider people with developing, ageing, or existing health vulnerabilities.',
  },
  {
    question: 'If you feel unwell while outdoors in haze, what should you do first?',
    options: ['Move to cleaner air', 'Run faster', 'Ignore it until tomorrow', 'Stand near a vehicle exhaust'],
    answer: 0,
    explanation: 'Move away from polluted air; seek medical advice if symptoms are serious or persist.',
    tip: 'First reduce your exposure by moving somewhere with cleaner air.',
  },
  {
    question: 'What does AQI help communicate?',
    options: ['The exact number of trees nearby', 'A summary of air pollution and potential health concern', 'The chance of earthquakes', 'The amount of rainfall last year'],
    answer: 1,
    explanation: 'An Air Quality Index summarizes pollution levels and the related level of health concern.',
    tip: 'AQI is a quick way to understand air conditions and possible health impacts.',
  },
  {
    question: 'Are Malaysia’s API and the US AQI always directly interchangeable?',
    options: ['Yes, they use exactly the same scale', 'Yes, if rounded', 'No, their calculations and bands differ', 'Only during the rainy season'],
    answer: 2,
    explanation: 'Malaysia’s API and the US AQI use different calculations and bands, so their values may not match.',
    tip: 'Different index systems can describe air quality using different scales.',
  },
  {
    question: 'What can a suitable air purifier do indoors?',
    options: ['Guarantee all air is risk-free', 'Help reduce some airborne particles', 'Change the outdoor AQI', 'Replace official health advice'],
    answer: 1,
    explanation: 'A suitable air purifier may reduce some particles in indoor air, but it does not make all air risk-free.',
    tip: 'Think of an air purifier as a way to reduce particles, not remove every risk.',
  },
  {
    question: 'If you must go out in heavy haze, what can help reduce particle exposure?',
    options: ['A well-fitted particulate respirator', 'A loose scarf in every situation', 'Sunglasses alone', 'Running to your destination'],
    answer: 0,
    explanation: 'A well-fitted particulate respirator can help reduce exposure; fit is important.',
    tip: 'The protective value depends on a proper seal and an appropriate respirator.',
  },
  {
    question: 'Why can PM2.5 be a concern?',
    options: ['It is too large to enter the body', 'It can travel deep into the lungs', 'It only affects visibility', 'It is a type of pollen forecast'],
    answer: 1,
    explanation: 'PM2.5 refers to fine particles small enough to travel deep into the lungs.',
    tip: 'Remember the particle size: fine particles can reach deeper into the respiratory system.',
  },
  {
    question: 'Which source may contribute to haze in the region?',
    options: ['Smoke from forest and peat fires', 'The sound of traffic', 'Cloud shadows', 'Moonlight'],
    answer: 0,
    explanation: 'Smoke from forest and peat fires can travel across borders and affect air quality.',
    tip: 'Smoke can travel far from where a fire starts.',
  },
  {
    question: 'Which is the best source for official local advisories?',
    options: ['An old social media post', 'A rumour from a neighbour', 'The relevant official authority', 'A random online comment'],
    answer: 2,
    explanation: 'Use official local advisories for current guidance and decisions.',
    tip: 'Check that your information comes from an authoritative, up-to-date source.',
  },
  {
    question: 'What should you do if breathing difficulty is severe?',
    options: ['Wait several days before acting', 'Seek urgent medical care', 'Exercise to test your lungs', 'Rely only on an AQI app'],
    answer: 1,
    explanation: 'Severe breathing difficulty needs prompt medical attention.',
    tip: 'Online guidance is not a substitute for urgent professional care.',
  },
  {
    question: 'What is a useful habit during haze conditions?',
    options: ['Check conditions again for updates', 'Assume conditions never change', 'Use yesterday’s reading for every decision', 'Ignore symptoms if AQI is low'],
    answer: 0,
    explanation: 'Air quality can change, so keep checking current readings and advisories.',
    tip: 'Conditions are dynamic; revisit reliable information when plans or conditions change.',
  },
]

// This component runs a 15-question haze safety quiz with answer feedback.
export function HazeQuiz() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [submittedAnswer, setSubmittedAnswer] = useState(null)
  const [correctQuestions, setCorrectQuestions] = useState(() => new Set())
  const question = questions[questionIndex]
  const isCorrect = submittedAnswer === question.answer

  function submitAnswer(event) {
    event.preventDefault()
    if (selectedAnswer === null || submittedAnswer !== null) return
    setSubmittedAnswer(selectedAnswer)
    if (selectedAnswer === question.answer) {
      setCorrectQuestions((answered) => new Set(answered).add(questionIndex))
    }
  }

  function advanceQuestion() {
    if (questionIndex === questions.length - 1) {
      setQuestionIndex(questions.length)
      return
    }
    setQuestionIndex((currentIndex) => currentIndex + 1)
    setSelectedAnswer(null)
    setSubmittedAnswer(null)
  }

  function retryQuestion() {
    setSelectedAnswer(null)
    setSubmittedAnswer(null)
  }

  function goToPreviousQuestion() {
    if (questionIndex === 0) return
    setQuestionIndex((currentIndex) => currentIndex - 1)
    setSelectedAnswer(null)
    setSubmittedAnswer(null)
  }

  function restartQuiz() {
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setSubmittedAnswer(null)
    setCorrectQuestions(new Set())
  }

  return (
    <section id="quiz" className="mt-12 scroll-mt-6" aria-labelledby="quiz-title">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Test what you know</p>
        <h2 id="quiz-title" className="mt-2 text-2xl font-semibold text-[#173b34]">Haze safety quiz</h2>
        <p className="mt-2 text-sm text-slate-600">15 quick questions to practise making informed choices during haze.</p>
      </div>
      {questionIndex === questions.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
          <h3 className="text-xl font-semibold text-[#173b34]">Quiz complete!</h3>
          <p className="mt-2 text-slate-700">You answered {correctQuestions.size} of {questions.length} questions correctly.</p>
          <button type="button" className="btn btn-outline mt-4 border-emerald-800 text-emerald-800" onClick={restartQuiz}>
            Try again
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={submitAnswer}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Question {questionIndex + 1} of {questions.length}
              </p>
              <p className="text-xs font-semibold text-emerald-800">Score: {correctQuestions.size}</p>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-800">{question.question}</h3>
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">Choose one answer</legend>
              {question.options.map((option, index) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm text-slate-700 ${
                    submittedAnswer === index
                      ? index === question.answer
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-rose-300 bg-rose-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    className="radio radio-sm mt-0.5"
                    type="radio"
                    name={`haze-question-${questionIndex}`}
                    value={index}
                    checked={selectedAnswer === index}
                    disabled={submittedAnswer !== null}
                    onChange={() => setSelectedAnswer(index)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline btn-sm border-slate-300 text-slate-700"
                onClick={goToPreviousQuestion}
                disabled={questionIndex === 0}
              >
                Previous question
              </button>
              {submittedAnswer !== null && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm border-emerald-700 text-emerald-800"
                  onClick={retryQuestion}
                >
                  Retry this question
                </button>
              )}
            </div>
            {submittedAnswer === null ? (
              <button type="submit" className="btn btn-primary mt-3" disabled={selectedAnswer === null}>
                Submit answer
              </button>
            ) : (
              <button type="button" className="btn btn-primary mt-3" onClick={advanceQuestion}>
                {questionIndex === questions.length - 1 ? 'Finish quiz' : 'Next question'}
              </button>
            )}
          </form>

          <aside className="min-h-64 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-live="polite">
            {submittedAnswer === null ? (
              <>
                <h3 className="text-lg font-semibold text-[#173b34]">Answer feedback</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">Choose one of the four options and submit your answer to see whether it is correct, with an explanation and a practical tip.</p>
              </>
            ) : (
              <>
                <p className={`text-xs font-bold uppercase tracking-wide ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isCorrect ? 'Correct — well done!' : 'Not quite — keep learning'}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[#173b34]">
                  {isCorrect ? 'Congratulations!' : 'A helpful tip'}
                </h3>
                {!isCorrect && (
                  <p className="mt-3 text-sm text-slate-700">
                    Correct answer: <strong>{question.options[question.answer]}</strong>
                  </p>
                )}
                <p className="mt-3 text-sm leading-6 text-slate-600">{question.explanation}</p>
                <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                  <strong>Tip:</strong> {question.tip}
                </p>
              </>
            )}
          </aside>
        </div>
      )}
    </section>
  )
}
