import re,glob,os,json
C='src/client/components/'
files=sorted(set(glob.glob(C+'*Widget*.tsx')+[C+x for x in ['EmotionalCheckIn.tsx','SelfCareMoments.tsx','EnergyCapacitor.tsx','MoodAnalytics.tsx','FlashDriveManifest.tsx','FourDimensionalUI.tsx','JournalReflection.tsx']]+glob.glob(C+'stats/*.tsx')))
sysx=open(C+'System.tsx').read()
rows=[]
for f in files:
    s=open(f).read(); n=os.path.basename(f)[:-4]
    si=len(re.findall(r'setInterval\(',s)); ci=len(re.findall(r'clearInterval\(',s))
    st=len(re.findall(r'setTimeout\(',s)); ct=len(re.findall(r'clearTimeout\(',s))
    ael=len(re.findall(r'addEventListener\(',s)); rel=len(re.findall(r'removeEventListener\(',s))
    api=sorted(set(re.findall(r"['`\"](/api/[a-zA-Z0-9_\-/]+)",s)))
    r=dict(name=n,loc=s.count('\n'),
      interval=f"{si}/{ci}",timeout=f"{st}/{ct}",listeners=f"{ael}/{rel}",
      api=api,
      ls=len(re.findall(r'localStorage',s)),
      persistent=bool(re.search(r'persistentAtom|persistentMap',s)),
      qie=bool(re.search(r'recordSignal|intentionEngine|recordAstrologySignal',s)),
      memory=bool(re.search(r'[Mm]emory',s)), story=bool(re.search(r'[Ss]tory|[Nn]arrative',s)),
      ai=bool(re.search(r'/api/(ai|chat|llm|memory|narrative|quantum|oracle)|useAI|anthropic|claude',s,re.I)),
      log=bool(re.search(r'/api/logs|createLog|useCreateLog|recordLog|logEvent|addLog',s)),
      sound=bool(re.search(r'sound|playSound|Audio\(|audioContext|AudioContext',s,re.I)),
      weather=bool(re.search(r'weather',s,re.I)), online=bool(re.search(r'usersOnline|online',s,re.I)),
      mounted_in_system=(n in sysx),
      boundary=bool(re.search(r'<WidgetErrorBoundary[^>]*>\s*<'+n+r'\b',sysx)),
      memo=bool(re.search(r'React\.memo|memo\(',s)),
      catch_count=len(re.findall(r'\.catch\(|catch\s*\(',s)),
      console=len(re.findall(r'console\.(log|warn|error)',s)),
      tests=len(glob.glob('**/*'+n+'*.test.*',recursive=True)),
    )
    rows.append(r)
print('name loc int to lis api ls pers qie mem story ai log snd sys bnd memo')
for r in rows:
    print(r['name'],r['loc'],r['interval'],r['timeout'],r['listeners'],len(r['api']),r['ls'],int(r['persistent']),int(r['qie']),int(r['memory']),int(r['story']),int(r['ai']),int(r['log']),int(r['sound']),int(r['mounted_in_system']),int(r['boundary']),int(r['memo']),r['console'])
