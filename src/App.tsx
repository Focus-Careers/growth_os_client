import { useState, useRef, useEffect } from 'react'
import './styles.css'
import supabase from './services/supabase'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import EntryHeader from './components/EntryHeader'

const INTRO_MESSAGES = [
  { body: 'Hey 👋 how are you?', delay: 1000 },
  { body: "I'm Watson - Chief Marketing Officer of GrowthOS - an AI-powered plug & play marketing department built by Venture Labs.", delay: 1800 },
  { body: 'At my disposal I have a team of 42 AI employees, ready to fuel growth at your organisation.', delay: 1800 },
  { body: 'PS: For lots of companies, GrowthOS already *is* the marketing department - but of course the team are also happy to work alongside your existing marketing department to do your time-consuming administrative tasks and fill any skill gaps that you might have.', delay: 2800 },
  { body: 'Want to get started or hear more?', delay: 1000, options: ["Let's get started", "I want to hear more"] },
]

const MORE_QUESTIONS_MESSAGES = [
  { body: "Go ahead - I'm at your disposal 😉", delay: 1000 },
  { body: "Once you're ready to try it out, let me know.", delay: 1200 },
]

const HEAR_MORE_MESSAGES = [
  { body: "Sure. Here's how it works.", delay: 1000 },
  { body: "Each of our AI employees has a bunch of skills. Let's use an example - our Lead Generation Expert.", delay: 1800 },
  { body: "One of the skills they have under their belt is the ability to go out and trawl the web for potential customers, working tirelessly (without breaks!) to build a massive database. It's one of those classic administrative tasks that it's definitely worth having an AI do instead of paying a human!", delay: 3000 },
  { body: "That's just one example - altogether we have 42 employees, with 1,027 skills between them!", delay: 2000 },
  { body: "Importantly, they can work together too. So, once the Lead Generation Expert has done his thing, we can ask the Campaign Manager to build an email campaign and reach out to them. Clever, hey?", delay: 2800 },
  { body: "Got more questions, or want to try it out?", delay: 1000, options: ["I still have more questions", "I'll try it out!"] },
]

interface Message {
  message_body: string
  is_agent: boolean
  timestamp: Date
  options?: string[]
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-dot-new" />
      <div className="typing-dot-new" />
      <div className="typing-dot-new" />
    </div>
  )
}

interface AppProps {
  onBack?: () => void
}

function App({ onBack }: AppProps) {
  const [input_bar_enabled, setInputBarEnabled] = useState(true)
  const [freetype_conversation, setFreeypeConversation] = useState(false)
  const [mobilisation_active, setMobilisationActive] = useState(false)
  const [current_step, setCurrentStep] = useState<any>(null)
  const [mobilisation_responses, setMobilisationResponses] = useState<Record<string, string>>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [user, setUser] = useState<any>(undefined)
  const [isTyping, setIsTyping] = useState(false)
  const [options, setOptions] = useState<string[] | null>(null)
  const [usedOptionIndices, setUsedOptionIndices] = useState<Set<number>>(new Set())
  const [inputFocused, setInputFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const introRan = useRef(false)
  const startTimeRef = useRef(new Date())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user === undefined) return

    if (user === null && !introRan.current) {
      introRan.current = true
      setInputBarEnabled(false)
      runIntroSequence()
    }
  }, [user])

  async function runMessageSequence(
    messageList: Array<{ body: string; delay: number; options?: string[] }>,
    optionsAfter: string[] | null = null,
    onComplete: (() => void) | null = null,
  ) {
    for (const msg of messageList) {
      setIsTyping(true)
      await delay(msg.delay)
      setIsTyping(false)
      const newMsg: Message = {
        message_body: msg.body,
        is_agent: true,
        timestamp: new Date(),
      }
      if (msg.options) {
        newMsg.options = msg.options
      }
      setMessages(prev => [...prev, newMsg])
      await delay(400)
    }
    if (optionsAfter) setOptions(optionsAfter)
    if (onComplete) onComplete()
  }

  async function runIntroSequence() {
    await delay(600)
    await runMessageSequence(INTRO_MESSAGES)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    console.log('State:', {
      input_bar_enabled,
      freetype_conversation,
      mobilisation_active,
      current_step,
      mobilisation_responses,
      messages,
      user,
      isTyping,
      options,
    })
  }, [input_bar_enabled, freetype_conversation, mobilisation_active, current_step, mobilisation_responses, messages, user, isTyping, options])

  async function showStepMessages(step: any) {
    const added: Message[] = []
    for (const body of step.messages) {
      setIsTyping(true)
      await delay(1000)
      setIsTyping(false)
      const msg: Message = { message_body: body, is_agent: true, timestamp: new Date() }
      setMessages(prev => [...prev, msg])
      added.push(msg)
      await delay(400)
    }
    return added
  }

  async function startMobilisation(name: string) {
    setInputBarEnabled(false)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mobilisation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobilisation: name }),
      })
      const result = await res.json()
      if (result.step) {
        setMobilisationActive(true)
        setCurrentStep(result.step)
        await showStepMessages(result.step)
        if (result.step.type !== 'end_flow') setInputBarEnabled(true)
      }
    } catch (err) {
      console.error('mobilisation start error:', err)
      setInputBarEnabled(true)
    }
  }

  function handleOptionSelect(text: string, msgIndex?: number) {
    setOptions(null)
    if (msgIndex !== undefined) {
      setUsedOptionIndices(prev => new Set([...prev, msgIndex]))
    }
    setMessages(prev => [...prev, {
      message_body: text,
      is_agent: false,
      timestamp: new Date(),
    }])

    if (text === "Let's get started") {
      startMobilisation('sign_up_no_account')
    } else if (text === "I want to hear more") {
      runMessageSequence(HEAR_MORE_MESSAGES)
    } else if (text === "I still have more questions") {
      runMessageSequence(MORE_QUESTIONS_MESSAGES, null, () => {
        setInputBarEnabled(true)
        setFreeypeConversation(true)
      })
    } else if (text === "I'll try it out!") {
      startMobilisation('sign_up_no_account')
    }
  }

  async function handleSend() {
    const text = inputValue.trim()
    if (!text || !input_bar_enabled) return

    const newMessage: Message = {
      message_body: text,
      is_agent: false,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setInputValue('')

    if (mobilisation_active && current_step?.next_id) {
      setInputBarEnabled(false)

      const responseKey = current_step.response_key ?? current_step.id
      const updatedResponses = { ...mobilisation_responses, [responseKey]: text }
      setMobilisationResponses(updatedResponses)

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mobilisation/step`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobilisation: 'sign_up_no_account', step_id: current_step.next_id, value: text }),
        })
        const result = await res.json()
        if (result.step) {
          setCurrentStep(result.step)
          const addedMessages = await showStepMessages(result.step)
          if (result.step.type === 'end_flow') {
            const completeRes = await fetch(`${import.meta.env.VITE_API_URL}/api/mobilisation/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mobilisation: 'sign_up_no_account', responses: updatedResponses, messages: [...updatedMessages, ...addedMessages] }),
            })
            const completeData = await completeRes.json()
            if (completeData.result?.login_url) {
              window.location.href = completeData.result.login_url
            }
          } else {
            setInputBarEnabled(true)
          }
        }
      } catch (err) {
        console.error('mobilisation step error:', err)
        setInputBarEnabled(true)
      }
      return
    }

    if (freetype_conversation && !mobilisation_active) {
      setInputBarEnabled(false)
      setIsTyping(true)
      const payload = updatedMessages.slice(-50)
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signup-processor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: payload }),
        })
        const result = await res.json()
        setIsTyping(false)

        if (result.path === 'trigger_mobilisation' && result.step) {
          setMobilisationActive(true)
          setFreeypeConversation(false)
          setCurrentStep(result.step)
          await showStepMessages(result.step)
          setInputBarEnabled(true)
        } else if (result.path === 'direct_response' && result.reply) {
          setIsTyping(true)
          await delay(1000)
          setIsTyping(false)
          setMessages(prev => [...prev, {
            message_body: result.reply,
            is_agent: true,
            timestamp: new Date(),
          }])
          setInputBarEnabled(true)
        } else {
          setInputBarEnabled(true)
        }
      } catch (err) {
        console.error('signup_processor error:', err)
        setIsTyping(false)
        setInputBarEnabled(true)
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSend()
  }

  function getTimestamp(msgIndex: number) {
    const t = new Date(startTimeRef.current.getTime() + msgIndex * 3000)
    return t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="entry-container">
      {/* Top bar */}
      <div className="entry-topbar">
        <div className="topbar-left">
          {onBack && (
            <button className="vos-back" onClick={onBack}>
              <span>←</span>
              <span>V<span className="vos-green">OS</span></span>
            </button>
          )}
          <span className="growthOS-logo">
            growth<span className="accent">OS</span>
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="entry-scroll-area">
        {/* Margin line — inside the centred container */}
        <div className="margin-line" />
        <EntryHeader />

        {/* Messages */}
        <div className="entry-messages">
          {messages.map((msg, i) => {
            const isFirstAgentInRun =
              msg.is_agent && (i === 0 || !messages[i - 1]?.is_agent)

            return (
              <div key={i}>
                <div className="msg-animate">
                  <div className={`msg-col ${msg.is_agent ? 'msg-col-left' : 'msg-col-right'}`}>
                    {isFirstAgentInRun && (
                      <div className="agent-label">WATSON</div>
                    )}
                    <div className={`bubble-new ${msg.is_agent ? 'bubble-agent' : 'bubble-user'}`}>
                      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                        {msg.message_body}
                      </ReactMarkdown>
                    </div>
                    <div className="msg-timestamp">{getTimestamp(i)}</div>
                  </div>
                </div>
                {/* Options — right-aligned, outside the bubble */}
                {msg.options && !usedOptionIndices.has(i) && (
                  <div className="msg-animate">
                    <div className="options-row">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          className="option-pill-new"
                          onClick={() => handleOptionSelect(opt, i)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Legacy options support — for options set via setOptions() (mobilisation flow etc.) */}
          {options && (
            <div className="msg-animate">
              <div className="options-row">
                {options.map(opt => (
                  <button
                    key={opt}
                    className="option-pill-new"
                    onClick={() => handleOptionSelect(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTyping && (
            <div className="msg-animate">
              <TypingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="entry-input-area">
        <div className={`entry-input-line${inputFocused ? ' focused' : ''}`}>
          <input
            type="text"
            placeholder="Type a message…"
            className="entry-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          {inputValue && (
            <button className="send-btn" onClick={handleSend}>
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
