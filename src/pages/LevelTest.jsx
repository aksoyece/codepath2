import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const questions = [
  {
    id: 1,
    question: "Programlama deneyimin var mı?",
    multi: false,
    options: [
      "Hayır, hiç yapmadım",
      "Biraz denedim ama öğrenmedim",
      "Evet, birkaç dil biliyorum",
      "Evet, profesyonel olarak kullandım"
    ]
  },
  {
    id: 2,
    question: "Programlamayı neden öğrenmek istiyorsun?",
    multi: true,
    options: [
      "İş bulmak / kariyer değişikliği",
      "Kendi uygulama veya web sitemi yapmak",
      "Yapay zeka ve veri bilimi",
      "Oyun geliştirmek",
      "Hobi olarak",
      "Okul / ders için"
    ]
  },
  {
    id: 3,
    question: "Hangi alanda çalışmak istiyorsun?",
    multi: true,
    options: [
      "Web geliştirme (frontend / backend)",
      "Mobil uygulama",
      "Yapay zeka / makine öğrenmesi",
      "Oyun geliştirme",
      "Veri bilimi / analiz",
      "Siber güvenlik",
      "Henüz bilmiyorum"
    ]
  },
  {
    id: 4,
    question: "Daha önce hangi konularla karşılaştın?",
    multi: true,
    options: [
      "Hiçbiriyle karşılaşmadım",
      "Değişkenler ve döngüler",
      "Fonksiyonlar",
      "Nesne yönelimli programlama (OOP)",
      "Algoritmalar ve veri yapıları",
      "Veritabanı (SQL)"
    ]
  },
  {
    id: 5,
    question: "Matematik ve mantık konusunda kendini nasıl görüyorsun?",
    multi: false,
    options: [
      "Zayıf, matematiği sevmiyorum",
      "Orta seviye",
      "İyi, mantıksal düşünmeyi seviyorum",
      "Çok iyi, sayısal alandayım"
    ]
  },
  {
    id: 6,
    question: "Hangi platformda çalışıyorsun?",
    multi: true,
    options: ["Windows", "Mac", "Linux"]
  },
  {
    id: 7,
    question: "Haftada ne kadar zaman ayırabilirsin?",
    multi: false,
    options: [
      "1-2 saat",
      "3-5 saat",
      "5-10 saat",
      "10 saat ve üzeri"
    ]
  },
  {
    id: 8,
    question: "Hedefin ne zaman gerçekleşmesini istiyorsun?",
    multi: false,
    options: [
      "3 ay içinde",
      "6 ay içinde",
      "1 yıl içinde",
      "Acelem yok, sağlam öğrenmek istiyorum"
    ]
  }
]

export default function LevelTest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState([])
  const [finished, setFinished] = useState(false)
  const [roadmap, setRoadmap] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleOption = (option) => {
    const q = questions[current]
    if (!q.multi) {
      setSelected([option])
      return
    }
    if (selected.includes(option)) {
      setSelected(selected.filter(o => o !== option))
    } else {
      setSelected([...selected, option])
    }
  }

  const handleNext = async () => {
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected([])

    if (current + 1 < questions.length) {
      setCurrent(current + 1)
    } else {
      setLoading(true)

      const prompt = `Sen bir programlama eğitimi uzmanısın. Aşağıdaki kullanıcı bilgilerine göre kişisel bir öğrenme yol haritası oluştur.

Kullanıcı cevapları:
1. Deneyim: ${newAnswers[0]?.join(', ')}
2. Amaç: ${newAnswers[1]?.join(', ')}
3. Alan: ${newAnswers[2]?.join(', ')}
4. Bildiği konular: ${newAnswers[3]?.join(', ')}
5. Matematik: ${newAnswers[4]?.join(', ')}
6. Platform: ${newAnswers[5]?.join(', ')}
7. Haftalık süre: ${newAnswers[6]?.join(', ')}
8. Hedef süre: ${newAnswers[7]?.join(', ')}

Lütfen şunları içeren bir yol haritası yaz (Türkçe):
- Hangi programlama dilinden başlamalı ve neden
- Aylara göre öğrenme planı
- Hangi kaynakları kullanmalı
- Günlük pratik önerileri
- Hedef süreye göre gerçekçi beklentiler

Kısa ve net yaz, madde madde olsun.`

      try {
        const response = await fetch(
          'https://tojwguyvjgqnpfmjoqfo.supabase.co/functions/v1/generate-roadmap',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ prompt })
          }
        )
        const data = await response.json()
        const text = data.text || 'Yol haritası oluşturulamadı.'
        setRoadmap(text)

        const level = newAnswers[0]?.[0] === 'Hayır, hiç yapmadım' || newAnswers[0]?.[0] === 'Biraz denedim ama öğrenmedim' ? 'A1' : newAnswers[0]?.[0] === 'Evet, birkaç dil biliyorum' ? 'B1' : 'C1'

        await supabase.from('level_tests').insert({
          user_id: user.id,
          result_level: level,
          answers: newAnswers
        })

        await supabase.from('profiles').update({ level }).eq('id', user.id)

      } catch (err) {
        setRoadmap('Yol haritası oluşturulurken hata oluştu: ' + err.message)
      }

      setFinished(true)
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={styles.container}>
      <div style={styles.loadingBox}>
        <p style={styles.loadingText}>Kişisel yol haritanız oluşturuluyor...</p>
        <p style={styles.loadingSubtext}>Bu birkaç saniye sürebilir</p>
      </div>
    </div>
  )

  if (finished) return (
    <div style={styles.container}>
      <div style={styles.resultCard}>
        <h1 style={styles.title}>CodePath</h1>
        <p style={styles.subtitle}>Kişisel Yol Haritanız</p>
        <div style={styles.roadmap}>
          {roadmap.split('\n').map((line, i) => (
            <p key={i} style={line.startsWith('-') || line.match(/^\d/) ? styles.roadmapItem : styles.roadmapText}>
              {line}
            </p>
          ))}
        </div>
        <button style={styles.button} onClick={() => navigate('/dashboard')}>
          Öğrenmeye Başla
        </button>
      </div>
    </div>
  )

  const q = questions[current]

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>CodePath</h1>
        <p style={styles.subtitle}>Seni tanıyalım</p>

        <div style={styles.progress}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${(current / questions.length) * 100}%` }} />
          </div>
          <p style={styles.progressText}>{current + 1} / {questions.length}</p>
        </div>

        <p style={styles.question}>{q.question}</p>
        {q.multi && <p style={styles.multiHint}>Birden fazla seçebilirsin</p>}

        <div style={styles.options}>
          {q.options.map(option => (
            <button
              key={option}
              style={{
                ...styles.option,
                ...(selected.includes(option) ? styles.optionSelected : {})
              }}
              onClick={() => toggleOption(option)}
            >
              {selected.includes(option) && <span style={styles.check}>✓ </span>}
              {option}
            </button>
          ))}
        </div>

        <button
          style={{ ...styles.button, opacity: selected.length > 0 ? 1 : 0.4 }}
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          {current + 1 === questions.length ? 'Yol Haritamı Oluştur' : 'Sonraki'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '2rem 1rem' },
  card: { background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '540px' },
  resultCard: { background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '640px' },
  title: { color: '#00ff88', fontSize: '2rem', margin: '0 0 0.25rem', fontWeight: '700' },
  subtitle: { color: '#666', marginBottom: '1.5rem' },
  progress: { marginBottom: '1.5rem' },
  progressBar: { background: '#222', borderRadius: '99px', height: '6px', marginBottom: '0.5rem' },
  progressFill: { background: '#00ff88', height: '6px', borderRadius: '99px', transition: 'width 0.3s' },
  progressText: { color: '#666', fontSize: '0.85rem', margin: 0 },
  question: { color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.6' },
  multiHint: { color: '#444', fontSize: '0.85rem', marginBottom: '1rem' },
  options: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' },
  option: { background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', padding: '0.75rem 1rem', fontSize: '1rem', cursor: 'pointer', textAlign: 'left' },
  optionSelected: { border: '1px solid #00ff88', background: '#0a2a1a' },
  check: { color: '#00ff88' },
  button: { background: '#00ff88', color: '#000', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', width: '100%' },
  loadingBox: { textAlign: 'center' },
  loadingText: { color: '#00ff88', fontSize: '1.2rem', marginBottom: '0.5rem' },
  loadingSubtext: { color: '#444', fontSize: '0.9rem' },
  roadmap: { background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', maxHeight: '500px', overflowY: 'auto' },
  roadmapItem: { color: '#00ff88', fontSize: '0.95rem', margin: '0.25rem 0' },
  roadmapText: { color: '#ccc', fontSize: '0.95rem', margin: '0.5rem 0' },
}