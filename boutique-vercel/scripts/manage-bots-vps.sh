#!/bin/bash

# Script complet de gestion des bots sur VPS
# Compatible avec plusieurs bots sur le même serveur

echo "╔════════════════════════════════════════╗"
echo "║   GESTIONNAIRE DE BOTS TELEGRAM VPS   ║"
echo "╚════════════════════════════════════════╝"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fonction pour afficher l'état des connexions MongoDB
check_mongodb_connections() {
    echo -e "\n${CYAN}📊 Vérification des connexions MongoDB...${NC}"
    
    if [ -f "scripts/monitor-connections.js" ]; then
        timeout 5 node scripts/monitor-connections.js 2>/dev/null | head -20
    else
        echo -e "${YELLOW}⚠️  Script de monitoring non trouvé${NC}"
    fi
}

# Fonction pour nettoyer les connexions MongoDB
clean_mongodb_connections() {
    echo -e "\n${YELLOW}🧹 Nettoyage des connexions MongoDB...${NC}"
    
    if [ -f "scripts/fix-connections.js" ]; then
        node scripts/fix-connections.js
    else
        echo -e "${RED}❌ Script de nettoyage non trouvé${NC}"
    fi
}

# Fonction pour redémarrer un bot spécifique
restart_specific_bot() {
    local bot_identifier=$1
    
    # Vérifier si c'est un processus PM2
    if pm2 list | grep -q "$bot_identifier"; then
        echo -e "${YELLOW}🔄 Redémarrage via PM2...${NC}"
        pm2 restart "$bot_identifier"
        echo -e "${GREEN}✅ Bot redémarré avec PM2${NC}"
    else
        # Chercher le processus directement
        local pid=$(ps aux | grep -E "node.*$bot_identifier" | grep -v grep | awk '{print $2}')
        
        if [ -n "$pid" ]; then
            echo -e "${YELLOW}⚠️  Bot trouvé en dehors de PM2 (PID: $pid)${NC}"
            echo -e "${RED}Arrêt du processus...${NC}"
            kill -9 $pid
            
            # Proposer de le relancer avec PM2
            echo -e "${CYAN}Voulez-vous le relancer avec PM2 ? (recommandé) [o/n]${NC}"
            read -p "> " relaunch
            
            if [ "$relaunch" = "o" ] || [ "$relaunch" = "O" ]; then
                pm2 start "$bot_identifier" --name "bot-$(basename $bot_identifier .js)"
                echo -e "${GREEN}✅ Bot relancé avec PM2${NC}"
            fi
        else
            echo -e "${RED}❌ Bot non trouvé${NC}"
        fi
    fi
}

# Menu principal
while true; do
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}    MENU PRINCIPAL${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    echo "1)  📋 Voir TOUS les bots actifs"
    echo "2)  🔄 Redémarrer CE bot (MongoDB fix)"
    echo "3)  🔄 Redémarrer un bot spécifique"
    echo "4)  🔄 Redémarrer TOUS les bots"
    echo "5)  📊 Vérifier connexions MongoDB"
    echo "6)  🧹 Nettoyer connexions MongoDB"
    echo "7)  📜 Voir les logs d'un bot"
    echo "8)  🚀 Démarrer un nouveau bot"
    echo "9)  ⏹️  Arrêter un bot"
    echo "10) 💾 Sauvegarder config PM2"
    echo "11) 🔍 Diagnostique complet"
    echo "0)  ❌ Quitter"
    echo ""
    read -p "Votre choix: " choice

    case $choice in
        1)
            echo -e "\n${GREEN}📋 BOTS ACTIFS:${NC}"
            echo -e "${CYAN}--- Processus PM2 ---${NC}"
            pm2 list
            echo -e "\n${CYAN}--- Autres processus Node ---${NC}"
            ps aux | grep -E "node.*(bot|webhook)" | grep -v grep | grep -v "pm2" || echo "Aucun"
            ;;
        
        2)
            echo -e "\n${YELLOW}🔄 REDÉMARRAGE DU BOT PRINCIPAL${NC}"
            
            # Nettoyer les connexions d'abord
            clean_mongodb_connections
            
            # Identifier le bot principal
            BOT_FILE=""
            if [ -f "bot-mongodb-webhook.js" ]; then
                BOT_FILE="bot-mongodb-webhook.js"
            elif [ -f "bot-webhook-fixed.js" ]; then
                BOT_FILE="bot-webhook-fixed.js"
            elif [ -f "bot.js" ]; then
                BOT_FILE="bot.js"
            fi
            
            if [ -n "$BOT_FILE" ]; then
                restart_specific_bot "$BOT_FILE"
                
                # Vérifier les connexions après redémarrage
                sleep 3
                check_mongodb_connections
            else
                echo -e "${RED}❌ Aucun bot trouvé dans ce projet${NC}"
            fi
            ;;
        
        3)
            echo -e "\n${GREEN}📋 Bots disponibles:${NC}"
            pm2 list
            echo ""
            read -p "Nom ou ID du bot à redémarrer: " bot_name
            restart_specific_bot "$bot_name"
            ;;
        
        4)
            echo -e "\n${YELLOW}🔄 REDÉMARRAGE DE TOUS LES BOTS${NC}"
            clean_mongodb_connections
            pm2 restart all
            echo -e "${GREEN}✅ Tous les bots redémarrés${NC}"
            sleep 3
            check_mongodb_connections
            ;;
        
        5)
            check_mongodb_connections
            ;;
        
        6)
            clean_mongodb_connections
            ;;
        
        7)
            echo -e "\n${GREEN}📋 Bots disponibles:${NC}"
            pm2 list
            echo ""
            read -p "Nom ou ID du bot: " bot_name
            echo -e "${CYAN}📜 Logs (Ctrl+C pour quitter):${NC}"
            pm2 logs "$bot_name" --lines 50
            ;;
        
        8)
            echo -e "\n${GREEN}🚀 DÉMARRAGE D'UN NOUVEAU BOT${NC}"
            echo "Fichiers bot disponibles:"
            ls -la *.js | grep -E "(bot|webhook)" | awk '{print "  - " $9}'
            echo ""
            read -p "Nom du fichier: " bot_file
            read -p "Nom dans PM2: " pm2_name
            
            if [ -f "$bot_file" ]; then
                pm2 start "$bot_file" --name "$pm2_name"
                echo -e "${GREEN}✅ Bot démarré${NC}"
            else
                echo -e "${RED}❌ Fichier non trouvé${NC}"
            fi
            ;;
        
        9)
            echo -e "\n${GREEN}📋 Bots actifs:${NC}"
            pm2 list
            echo ""
            read -p "Nom ou ID du bot à arrêter: " bot_name
            pm2 stop "$bot_name"
            echo -e "${GREEN}✅ Bot arrêté${NC}"
            ;;
        
        10)
            echo -e "\n${YELLOW}💾 Sauvegarde de la configuration PM2...${NC}"
            pm2 save
            echo -e "${GREEN}✅ Configuration sauvegardée${NC}"
            echo -e "${CYAN}Pour démarrage automatique au boot:${NC}"
            echo "  pm2 startup"
            ;;
        
        11)
            echo -e "\n${MAGENTA}🔍 DIAGNOSTIQUE COMPLET${NC}"
            echo -e "${CYAN}═══════════════════════════════════════${NC}"
            
            # État PM2
            echo -e "\n${YELLOW}1. État PM2:${NC}"
            pm2 list
            
            # Connexions MongoDB
            echo -e "\n${YELLOW}2. Connexions MongoDB:${NC}"
            check_mongodb_connections
            
            # Mémoire
            echo -e "\n${YELLOW}3. Utilisation mémoire:${NC}"
            free -h
            
            # Processus Node
            echo -e "\n${YELLOW}4. Processus Node actifs:${NC}"
            ps aux | grep node | grep -v grep | wc -l
            echo "Nombre de processus Node: $(ps aux | grep node | grep -v grep | wc -l)"
            
            # Espace disque
            echo -e "\n${YELLOW}5. Espace disque:${NC}"
            df -h | grep -E "^/dev/"
            
            echo -e "\n${GREEN}✅ Diagnostique terminé${NC}"
            ;;
        
        0)
            echo -e "${GREEN}👋 Au revoir!${NC}"
            exit 0
            ;;
        
        *)
            echo -e "${RED}❌ Option invalide${NC}"
            ;;
    esac
    
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
done