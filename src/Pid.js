const PROC_NUM_FIELD = '__pid'

export default function Pid (num) {
  this[PROC_NUM_FIELD] = num
}

let lastID = 0

Pid.new = () => new Pid(++lastID)

Pid.raw = (subject) => subject[PROC_NUM_FIELD]

Pid.isPid = pidMaybe => (
  typeof pidMaybe === 'object' &&
  pidMaybe &&
  typeof Pid.raw(pidMaybe) === 'number' &&
  Pid.raw(pidMaybe)
)

Pid.fromJSON = (o) => Pid.new(o[PROC_NUM_FIELD])

Pid.equals = (p1, p2) => Pid.raw(p1) === Pid.raw(p2)

Pid.prototype = {
  valueOf () { return Pid.raw(this) },
  toString () { return Pid.raw(this).toString() },
  toJSON () { return {[PROC_NUM_FIELD]: Pid.raw(this)} }
}
