class SilentReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig
    this._options = options
  }

  onRunStart() {}

  onTestStart() {}

  onTestResult() {}

  onRunComplete() {}
}

module.exports = SilentReporter

