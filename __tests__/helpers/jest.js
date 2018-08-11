const isError = o => o instanceof Error
const isObject = o => typeof o === 'object' && !isError(o)

const serializers = {
  errorSerializer: {
    print: o => JSON.stringify(o.toJSON ? o.toJSON() : o.toString(), null, 2),
    test: o => o && isError(o)
  },
  objectSerializer: {
    print: o => JSON.stringify(o, null, 2),
    test: o => o && isObject(o)
  }
}

module.exports.addSnapshotSerializers = () => {
  Object.values(serializers).forEach(serializer =>
    expect.addSnapshotSerializer(serializer)
  )
}
