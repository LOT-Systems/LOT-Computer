// LOT-FM-001 COGS model. Run: node scripts/basics-cogs.mjs  (exit 1 if ceiling breached)
// no -> [unit landed USD, qty, period months]. Private: never import into client bundle.
const U = {1:[3.0,1,3],2:[1.8,1,1],3:[1.1,1,1],4:[1.4,1,1],5:[2.4,1,1],6:[2.2,1,1],7:[0.9,1,1],8:[0.2,6,1],9:[0.15,8,1],
10:[0.6,4,1],11:[1.2,1,3],12:[3.0,1,3],13:[2.0,1,12],14:[1.5,1,12],15:[3.0,3,3],16:[2.2,3,3],17:[4.0,2,6],18:[5.0,1,6],
19:[1.3,2,6],20:[3.5,1,12],21:[0.25,4,1],22:[3.0,1,3],23:[0.2,20,6]}
const SHIP=6.5, PACK=1.6, CARD=0.4, PAYFEE=0.029*100+0.30
let items=0; for(const [c,q,p] of Object.values(U)) items+=c*q/p
const cogs=items+SHIP+PACK+CARD, total=cogs+PAYFEE, price=100
console.log({items:+items.toFixed(2),ship:SHIP,pack:PACK,card:CARD,payFee:+PAYFEE.toFixed(2),landed:+cogs.toFixed(2),allIn:+total.toFixed(2),margin:+(1-total/price).toFixed(3)})
if(cogs>40||1-total/price<0.6){console.error('CEILING BREACH');process.exit(1)}
