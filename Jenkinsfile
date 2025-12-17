pipeline {
    agent any

    environment {
        APP_ENV = 'test'
        SWAGGER_ENABLED = '0'
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
        SQLALCHEMY_TEST_DATABASE_URI = 'sqlite:///:memory:'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Packages') {
            steps {
                sh '''
                    python3 -m pip install --upgrade pip
                    python3 -m pip install -r requirements.txt
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    mkdir -p test-results
                    python3 -m pytest \
                        --cov=. \
                        --cov-report=xml:coverage.xml \
                        -q tests/ \
                        --junitxml=test-results/pytest.xml
                '''
            }
        }

        stage('SonarQube Analysis') {
            when { branch 'develop' }
            steps {
                withSonarQubeEnv('Sonar IUT') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=DUT-Info-Montreuil_SAE_S5_MEMORA_BACKEND_PONNOU_AGOGUE_BOUQSI_FELLAH_SASIKUMAR_212059b3-29bc-493a-b7dc-a8adb99c83e2 \
                          -Dsonar.python.coverage.reportPaths=coverage.xml
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'test-results/**/*,coverage.xml', allowEmptyArchive: true
            junit testResults: 'test-results/pytest.xml', allowEmptyResults: true
        }
    }
}
