import { useState, useRef, useEffect } from 'react'
import './App.css'
import avatarImg from './assets/avatar.png'
import watsonImg from './assets/Watson.png'
import belfortImg from './assets/Belfort.png'
import warrenImg from './assets/Warren.png'
import pepperImg from './assets/Pepper.png'
import supabase from './services/supabase'
import ReactMarkdown from 'react-markdown'

const INTRO_MESSAGES = [
  { body: 'Hey 👋 how are you?', delay: 1000 },
  { body: "I'm Watson - Chief Marketing Officer of GrowthOS - an AI-powered plug & play marketing department built by Venture Labs.", delay: 1800 },
  { body: 'At my disposal I have a team of 42 AI employees, ready to fuel growth at your organisation.', delay: 1800 },
  { body: 'PS: For lots of companies, GrowthOS already *is* the marketing department - but of course the team are also happy to work alongside your existing marketing department to do your time-consuming administrative tasks and fill any skill gaps that you might have.', delay: 2800 },
  { body: 'Want to get started or hear more?', delay: 1000 },
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
  { body: "Got more questions, or want to try it out?", delay: 1000 },
]

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function App() {
  const [input_bar_enabled, setInputBarEnabled] = useState(true)
  const [freetype_conversation, setFreeypeConversation] = useState(false)
  const [mobilisation_active, setMobilisationActive] = useState(false)
  const [current_step, setCurrentStep] = useState(null)
  const [mobilisation_responses, setMobilisationResponses] = useState({})
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [user, setUser] = useState(undefined)
  const [isTyping, setIsTyping] = useState(false)
  const [options, setOptions] = useState(null)
  const messagesEndRef = useRef(null)
  const introRan = useRef(false)

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

  async function runMessageSequence(messageList, optionsAfter = null, onComplete = null) {
    for (const msg of messageList) {
      setIsTyping(true)
      await delay(msg.delay)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        message_body: msg.body,
        is_agent: true,
        timestamp: new Date(),
      }])
      await delay(400)
    }
    if (optionsAfter) setOptions(optionsAfter)
    if (onComplete) onComplete()
  }

  async function runIntroSequence() {
    await delay(600)
    await runMessageSequence(INTRO_MESSAGES, ["Let's get started", "I want to hear more"])
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    console.log('🧠 State:', {
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

  async function showStepMessages(step) {
    const added = []
    for (const body of step.messages) {
      setIsTyping(true)
      await delay(1000)
      setIsTyping(false)
      const msg = { message_body: body, is_agent: true, timestamp: new Date() }
      setMessages(prev => [...prev, msg])
      added.push(msg)
      await delay(400)
    }
    return added
  }

  async function startMobilisation(name) {
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

  function handleOptionSelect(text) {
    setOptions(null)
    setMessages(prev => [...prev, {
      message_body: text,
      is_agent: false,
      timestamp: new Date(),
    }])

    if (text === "Let's get started") {
      startMobilisation('sign_up_no_account')
    } else if (text === "I want to hear more") {
      runMessageSequence(HEAR_MORE_MESSAGES, ["I still have more questions", "I'll try it out!"])
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

    const newMessage = {
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
      console.log('📋 Mobilisation: sign_up_no_account')
      console.log('📝 Responses so far:', updatedResponses)

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mobilisation/step`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobilisation: 'sign_up_no_account', step_id: current_step.next_id, value: text }),
        })
        const result = await res.json()
        console.log('📨 Step response:', result)
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

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend()
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div id="layout">
      <aside id="sidebar-icon-rail">
        <div className="rail-icon-btn active">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
      </aside>

      <aside id="sidebar-panel">
        <h1 id="sidebar-heading">
          growthOS<span className="logo-dot">.</span><span className="logo-version">v0.1</span>
        </h1>
        <div id="employee-list">
          {[
            { name: 'Watson', role: 'Chief Marketing Officer', img: watsonImg, active: true },
            { name: 'Belfort', role: 'Lead Generation Expert', img: belfortImg, active: false },
            { name: 'Warren', role: 'Business Analyst', img: warrenImg, active: false },
            { name: 'Pepper', role: 'Office Administrator', img: pepperImg, active: false },
          ].map(emp => (
            <div key={emp.name} className={`employee-row${emp.active ? ' selected' : ' locked'}`}>
              <div className="employee-avatar">
                {emp.img ? <img src={emp.img} alt={emp.name} /> : emp.name[0]}
              </div>
              <div className="employee-info">
                <span className="employee-name">{emp.name}</span>
                <span className="employee-role">{emp.role}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div id="main-content">
        <nav id="top-nav">
          <div id="top-nav-profile">
            <img id="top-nav-avatar" src={watsonImg} alt="Watson" />
            <div id="top-nav-name-wrap">
              <span id="top-nav-name">Watson</span>
              <span id="top-nav-title">Chief Marketing Officer</span>
            </div>
          </div>
        </nav>

        <div id="main-body">
          {messages.map((msg, i) => (
            <div key={i} className={msg.is_agent ? 'msg-row agent' : 'msg-row user'}>
              <div className={msg.is_agent ? 'bubble agent' : 'bubble user'}>
                <div className="bubble-body"><ReactMarkdown>{msg.message_body}</ReactMarkdown></div>
                <p className="bubble-time">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}

          {options && (
            <div className="msg-row user">
              <div id="option-pills">
                {options.map(opt => (
                  <button key={opt} className="option-pill" onClick={() => handleOptionSelect(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTyping && (
            <div className="msg-row agent">
              <div className="bubble agent typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div id="input-bar">
          <div id="input-wrap">
            <input
              type="text"
              placeholder="Your message"
              id="message-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div id="input-actions">
              <button id="mic-btn" aria-label="Voice input">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <button id="send-btn" aria-label="Send" disabled={!input_bar_enabled} onClick={handleSend}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
