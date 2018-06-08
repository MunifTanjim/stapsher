const serializers = {
  errorSerializer: {
    print: o => JSON.stringify(o, null, 2),
    test: o => o && typeof o === 'object'
  },
  objectSerializer: {
    print: o => JSON.stringify(o.toJSON ? o.toJSON() : o, null, 2),
    test: o => o && o instanceof Error
  }
}

module.exports.addSnapshotSerializers = () => {
  Object.values(serializers).forEach(serializer =>
    expect.addSnapshotSerializer(serializer)
  )
}
