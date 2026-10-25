// HU-INF-05: pipeline de despliegue con Jenkins.
// Jenkins corre en la MISMA EC2 que la aplicación (criterio de la historia).
// Etapas: pull -> build -> test -> deploy. La instalación y el job están
// documentados en docs/jenkins.md.
pipeline {
  agent any

  environment {
    // En producción el frontend y la API comparten origen, así que la
    // variable del frontend queda como en el despliegue real.
    VITE_API_URL = '/api'
  }

  triggers {
    // GitHub cada 5 minutos: si main avanzó, se ejecuta el pipeline.
    pollSCM('H/5 * * * *')
  }

  options {
    // Un solo deploy a la vez y con tiempo máximo para no colgar builds.
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {
    stage('Pull') {
      steps {
        checkout scm
        sh 'git log -1 --oneline'
      }
    }

    stage('Build') {
      steps {
        dir('backend') {
          sh 'npm ci'
          sh 'npm run build'
        }
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Test') {
      steps {
        dir('backend') {
          sh 'npm test'
        }
      }
    }

    stage('Deploy') {
      steps {
        // El deploy corre como ubuntu, el usuario dueño de pm2 y de
        // /var/www/comercial360 (línea sudoers en docs/jenkins.md).
        // El script hace su propio pull, migraciones en RDS, copia del
        // frontend, reinicio con pm2 y espera a que /api/health responda.
        sh 'sudo -u ubuntu /home/ubuntu/comercial360/deploy/desplegar.sh main'
      }
    }
  }

  post {
    failure {
      echo 'Build en rojo: revisa la etapa fallida. La versión anterior sigue sirviendo.'
    }
    success {
      echo 'Deploy de main completado: /api/health respondiendo.'
    }
  }
}
