pipeline {
    agent any

    stages {
        stage('Git Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Packages') {
            steps {
                dir('') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('') {
                    sh 'npm run coverage'
                }
            }
        }

        stage('Build React') {
            steps {
                dir('') {
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            when { branch 'develop' }

            steps {
                withSonarQubeEnv('Sonar IUT') {
                    sh """sonar-scanner -Dsonar.projectKey=DUT-Info-Montreuil_SAE_S5_MEMORA_FRONTEND_PONNOU_AGOGUE_BOUQSI_FELLAH_SASIKUMAR_2c34d102-4501-4b54-9917-92c6600be634 \
                    -Dsonar.sources=src \
                    -Dsonar.tests=src \
                    -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx \
                    -Dsonar.exclusions=coverage/**,dist/**,node_modules/** \
                    -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info"""
                }
            }
        }
    }

    post {
        success {
            echo "Build React OK"
        }
        always {
            archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
        }
    }
}
