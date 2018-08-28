'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the ${chalk.red('generator-shopify')} generator!`)
    )

    const prompts = [
      {
        type: 'confirm',
        name: 'someAnswer',
        message: 'Would you like to enable this option?',
        default: true
      }
    ]

    return false;

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    })
  }

  writing() {
    const paths = [
      'bin',
      'client',
      'config',
      'migrations',
      'server',
      'knexfile.js',
      'package.json',
      'README.md',
      '.babelrc',
      '.env.example',
      '.eslintrc',
      '.gitignore'
    ]
    paths.forEach((p) => this.fs.copy(this.templatePath(p), this.destinationPath(p)))
  }

  install() {
    this.installDependencies();
  }
};
