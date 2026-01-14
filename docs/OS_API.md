# User Operating System API

The OS API treats each LOT user as a measurable, evolving system with health metrics, version progression, and diagnostic capabilities.

## Philosophy

Users are living systems that:
- **Evolve** through version milestones (v0.1 → v3.0)
- **Optimize** through consistent engagement and balance
- **Diagnose** their own patterns and bottlenecks
- **Perform** at measurable levels of consistency and depth

## Endpoints

### 1. GET `/api/os/status`

**System health check** - Current state of the user's LOT system.

**Response:**
```json
{
  "health": 75,
  "state": "engaged",
  "uptime": 45,
  "streak": 12,
  "lastActivity": "2026-01-14T10:30:00Z",
  "metrics": {
    "totalInteractions": 85,
    "memoryQuestions": 45,
    "journalEntries": 40,
    "engagementRate": 85
  }
}
```

**States:**
- `initializing` - No data yet
- `dormant` - No current streak
- `active` - Basic engagement
- `engaged` - Regular, consistent use
- `optimized` - High engagement rate (80%+)

**Health Score (0-100):**
- 0-25: Data health (answers collected)
- 0-25: Consistency health (streak maintained)
- 0-25: Engagement health (daily rate)
- 0-25: Maturity health (days since start)

---

### 2. GET `/api/os/version`

**OS version** - Progression and maturity level.

**Response:**
```json
{
  "version": "1.5.0",
  "name": "Engaged",
  "description": "Consistent usage, deep patterns",
  "progression": 45,
  "nextVersion": "2.0.0",
  "requirements": {
    "answers": 50,
    "days": 30
  },
  "unlocked": [
    "Badge system",
    "Advanced insights"
  ],
  "milestones": [
    "30 day milestone",
    "Deep pattern recognition"
  ]
}
```

**Version Progression:**

| Version | Name | Requirements | Unlocked Features |
|---------|------|--------------|-------------------|
| 0.1.0 | Initializing | 0 answers, 0 days | Memory, Basic logging |
| 0.5.0 | Emerging | 7 answers, 7 days | Memory, Mood, Pattern detection |
| 1.0.0 | Active | 20 answers, 14 days | All widgets, Psychological profiling |
| 1.5.0 | Engaged | 50 answers, 30 days | Badge system, Advanced insights |
| 2.0.0 | Optimized | 100 answers, 60 days | Full diagnostics, Cohort matching |
| 3.0.0 | Integrated | 200 answers, 120 days | All features, Legacy mode, Mentorship |

**Progression:** Percentage to next version (0-100)

---

### 3. GET `/api/os/insights`

**Pattern insights** - Real-time discoveries and recommendations.

**Response:**
```json
{
  "insights": [
    {
      "type": "temporal",
      "title": "Morning person",
      "description": "You engage most between 7-9 AM",
      "confidence": 0.85,
      "dataPoints": 25
    },
    {
      "type": "weather-mood",
      "title": "Energized in 18-22°C",
      "description": "75% of energized moments occur in this range",
      "confidence": 0.72,
      "dataPoints": 18
    }
  ],
  "recommendations": [
    "Strong timing pattern detected - maintain your rhythm",
    "Try a Mood check-in to track emotional patterns"
  ],
  "timestamp": "2026-01-14T10:30:00Z"
}
```

**Insight Types:**
- `weather-mood` - Correlations between weather and emotional state
- `temporal` - Time-of-day patterns
- `social-emotional` - Chat activity and mood correlations
- `streak` - Consistency patterns
- `behavioral` - Answer choice patterns

**Confidence:** 0-1 scale (how certain the pattern is)

---

### 4. GET `/api/os/performance`

**Engagement metrics** - Consistency, velocity, depth, and balance.

**Response:**
```json
{
  "overall": {
    "consistency": 85,
    "velocity": 72,
    "depth": 65,
    "balance": 80
  },
  "trends": {
    "weekly": [
      { "week": "2026-W01", "count": 12 },
      { "week": "2026-W02", "count": 15 },
      { "week": "2026-W03", "count": 18 }
    ],
    "trajectory": "increasing"
  },
  "benchmarks": {
    "answers": 45,
    "logs": 85,
    "avgPerWeek": 14.2
  }
}
```

**Metrics (0-100):**
- **Consistency:** Days with activity in last 7 days
- **Velocity:** Interactions per day over last 30 days
- **Depth:** Quality of engagement (note length, variety)
- **Balance:** Variety of widget usage

**Trajectory:**
- `increasing` - Recent activity > older activity by 20%+
- `stable` - Within 20% range
- `decreasing` - Recent activity < older activity by 20%+

---

### 5. GET `/api/os/diagnostics`

**System diagnostics** - Issues, bottlenecks, and optimization.

**Response:**
```json
{
  "status": "good",
  "optimizationScore": 85,
  "issues": [
    {
      "type": "inactivity",
      "severity": "medium",
      "description": "Last Memory question: 3 days ago",
      "suggestion": "Check in with a Memory question to maintain your streak"
    }
  ],
  "lastActivity": {
    "memory": "2026-01-11T10:30:00Z",
    "mood": "2026-01-14T08:00:00Z",
    "planner": "2026-01-13T07:00:00Z"
  },
  "recommendations": [
    "Check in with a Memory question to maintain your streak",
    "Check System page regularly to maintain rhythm"
  ]
}
```

**Status:**
- `optimal` - No issues detected
- `good` - Minor issues only
- `needs_attention` - High severity issues present

**Issue Severity:**
- `low` - Minor optimization opportunities
- `medium` - Patterns that could improve with attention
- `high` - Significant gaps or stagnation

**Optimization Score:** 100 - (issues × 15 points each)

---

### 6. GET `/api/os/config`

**System configuration** - User settings and preferences.

**Response:**
```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "tags": ["usership"]
  },
  "settings": {
    "privacy": {
      "isProfilePublic": true,
      "showWeather": true
    },
    "theme": {
      "current": "custom",
      "baseColor": "#ffffff",
      "accentColor": "#4A90E2"
    },
    "location": {
      "city": "San Francisco",
      "country": "United States"
    }
  },
  "features": {
    "usership": true,
    "publicProfile": true,
    "customUrl": "johndoe"
  }
}
```

---

## Use Cases

### Dashboard Display
```javascript
const { health, state, streak } = await fetch('/api/os/status').then(r => r.json())
// Display: "System Health: 85% • State: Engaged • Streak: 12 days"
```

### Progress Tracking
```javascript
const { version, progression, nextVersion } = await fetch('/api/os/version').then(r => r.json())
// Display: "v1.5.0 Engaged • 45% to v2.0.0"
```

### Pattern Discovery
```javascript
const { insights } = await fetch('/api/os/insights').then(r => r.json())
insights.forEach(insight => {
  if (insight.confidence > 0.7) {
    console.log(`✓ ${insight.title}: ${insight.description}`)
  }
})
```

### Performance Monitoring
```javascript
const { overall, trends } = await fetch('/api/os/performance').then(r => r.json())
// Chart: consistency, velocity, depth, balance over time
```

### System Maintenance
```javascript
const { issues, recommendations } = await fetch('/api/os/diagnostics').then(r => r.json())
// Show actionable suggestions to optimize engagement
```

---

## Integration Examples

### Settings Page - OS Info Panel
```tsx
const OSInfoPanel = () => {
  const [status, setStatus] = useState(null)
  const [version, setVersion] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/os/status').then(r => r.json()),
      fetch('/api/os/version').then(r => r.json()),
    ]).then(([s, v]) => {
      setStatus(s)
      setVersion(v)
    })
  }, [])

  return (
    <Block label="Operating System:" blockView>
      <div>Version: {version?.version} ({version?.name})</div>
      <div>Health: {status?.health}%</div>
      <div>Streak: {status?.streak} days</div>
      <div>State: {status?.state}</div>
    </Block>
  )
}
```

### System Page - Performance Metrics
```tsx
const PerformanceWidget = () => {
  const { overall } = useQuery('/api/os/performance')

  return (
    <Block label="Performance:" blockView>
      <div>Consistency: {overall?.consistency}%</div>
      <div>Velocity: {overall?.velocity}%</div>
      <div>Depth: {overall?.depth}%</div>
      <div>Balance: {overall?.balance}%</div>
    </Block>
  )
}
```

### Dashboard - Smart Recommendations
```tsx
const SmartRecommendations = () => {
  const { recommendations, issues } = useQuery('/api/os/diagnostics')

  return (
    <Block label="Recommendations:" blockView>
      {issues.filter(i => i.severity === 'high').map(issue => (
        <div key={issue.type} className="text-red">
          ⚠ {issue.suggestion}
        </div>
      ))}
      {recommendations.map((rec, i) => (
        <div key={i}>• {rec}</div>
      ))}
    </Block>
  )
}
```

---

## Design Principles

1. **Minimalist** - Clean, spreadsheet-style data structures
2. **Measurable** - Everything has a number (0-100 scales, version progression)
3. **Actionable** - Each endpoint provides clear next steps
4. **Progressive** - System evolves through clear milestones
5. **Diagnostic** - Built-in health checks and optimization suggestions

---

## Future Enhancements

- **OS Backups** - Export full system state
- **OS Restore** - Import previous states
- **OS Comparisons** - Compare with cohort averages
- **OS Forecasting** - Predict version progression timeline
- **OS Alerts** - Push notifications for optimization opportunities
