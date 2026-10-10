import { Routes, Route } from 'react-router-dom'

// Hub
import { HubPage } from '../pages/Hub/HubPage'
import { ParentHub } from '../pages/ParentHub/ParentHub'

// Arabic module (existing)
import { Home as ArabicHome } from '../pages/Home/Home'
import { Onboarding } from '../pages/Onboarding/Onboarding'
import { StudentLogin } from '../pages/Login/StudentLogin'
import { WorldPlaceholder } from '../pages/Worlds/WorldPlaceholder'
import { LettersWorld } from '../pages/Worlds/LettersWorld'
import { LetterDetail } from '../pages/Worlds/LetterDetail'
import { LetterWordsPage } from '../pages/Worlds/LetterWordsPage'
import { LetterGamePage } from '../pages/LessonPage/LetterGamePage'
import { HarakatWorld } from '../pages/Worlds/HarakatWorld'
import { HarakaDetail } from '../pages/Worlds/HarakaDetail'
import { HarakaGamePage } from '../pages/LessonPage/HarakaGamePage'
import { SyllablesWorld } from '../pages/Worlds/SyllablesWorld'
import { SyllableDetail } from '../pages/Worlds/SyllableDetail'
import { SyllableGamePage } from '../pages/LessonPage/SyllableGamePage'
import { WordsWorld } from '../pages/Worlds/WordsWorld'
import { WordLetterDetail } from '../pages/Worlds/WordLetterDetail'
import { WordGamePage } from '../pages/LessonPage/WordGamePage'
import { WordPositionGamePage } from '../pages/LessonPage/WordPositionGamePage'
import { LetterLocationGamePage } from '../pages/LessonPage/LetterLocationGamePage'
import { StoriesWorld } from '../pages/Worlds/StoriesWorld'
import { ParentDashboard } from '../pages/ParentDashboard/ParentDashboard'
import { ProtectedParentRoute } from './ProtectedParentRoute'
import { WorldGuard } from './WorldGuard'
import { STUDIO_ENABLED } from '../config/features'
import { SentencesWorld } from '../pages/Worlds/SentencesWorld'
import { VoiceStudio } from '../pages/VoiceStudio/VoiceStudio'
import { LetterWorldBackground } from '../components/ui/LetterWorldBackground'
import { SyllablesWorldBackground } from '../components/ui/SyllablesWorldBackground'
import { HarakatWorldBackground } from '../components/ui/HarakatWorldBackground'
import { SentencesWorldBackground } from '../components/ui/SentencesWorldBackground'
import { StoriesWorldBackground } from '../components/ui/StoriesWorldBackground'
import { WordsWorldBackground } from '../components/ui/WordsWorldBackground'
import { ArabicFinalTest } from '../pages/ArabicFinalTest/ArabicFinalTest'

// English module
import { EnglishHome } from '../english/pages/EnglishHome'
import { EnglishLettersWorld } from '../english/pages/EnglishLettersWorld'
import { EnglishLetterDetail } from '../english/pages/EnglishLetterDetail'
import { EnglishPhonicsWorld } from '../english/pages/EnglishPhonicsWorld'
import { EnglishWordsWorld } from '../english/pages/EnglishWordsWorld'
import { EnglishSentencesWorld } from '../english/pages/EnglishSentencesWorld'
import { EnglishStoriesWorld } from '../english/pages/EnglishStoriesWorld'
import { EnglishFinalTest } from '../english/pages/EnglishFinalTest'
import { EnglishParentDashboard } from '../english/pages/EnglishParentDashboard'
import { EnglishVoiceStudio } from '../english/pages/EnglishVoiceStudio'
import { EnglishBackground } from '../english/components/EnglishBackground'

// Discover module
import { DiscoverHome } from '../discover/pages/DiscoverHome'
import { WorldPage } from '../discover/pages/WorldPage'
import { DiscoverFinalTest } from '../discover/pages/DiscoverFinalTest'
import DiscoverVoiceStudio from '../discover/pages/DiscoverVoiceStudio'

// Numbers module
import { NumbersHome } from '../numbers/pages/NumbersHome'
import { NumbersMapPage } from '../numbers/pages/MapPage'
import { NumbersStagePage } from '../numbers/pages/StagePage'
import { NumbersLearnPage } from '../numbers/pages/LearnPage'
import { NumbersPracticePage } from '../numbers/pages/PracticePage'
import { NumbersGamesPage } from '../numbers/pages/GamesPage'
import { NumbersGameDetailPage } from '../numbers/pages/GameDetailPage'
import { NumberLinePage } from '../numbers/pages/NumberLinePage'
import { NumbersParentPage } from '../numbers/pages/NumbersParentPage'
import { NumbersChallengePage } from '../numbers/pages/ChallengePage'
import NumbersVoiceStudio from '../numbers/pages/NumbersVoiceStudio'

// Skills module
import SkillsHome from '../skills/pages/SkillsHome'
import SkillsGamePage from '../skills/pages/SkillsGamePage'
import SkillsLevelPage from '../skills/pages/SkillsLevelPage'

// Islamic module (أخلاقي الجميلة)
import { islamicRouteElements } from '../islamic'

export function AppRoutes() {
  return (
    <Routes>
      {/* HUB */}
      <Route path="/" element={<HubPage />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<ProtectedParentRoute><StudentLogin /></ProtectedParentRoute>} />
      <Route path="/parent" element={<ProtectedParentRoute><ParentHub /></ProtectedParentRoute>} />
      <Route path="/parent/arabic" element={<ProtectedParentRoute><ParentDashboard /></ProtectedParentRoute>} />
      <Route path="/parent/english" element={<EnglishBackground page="parent"><ProtectedParentRoute><EnglishParentDashboard /></ProtectedParentRoute></EnglishBackground>} />
      <Route path="/parent/numbers" element={<ProtectedParentRoute><NumbersParentPage /></ProtectedParentRoute>} />
      {STUDIO_ENABLED && <Route path="/voice-studio" element={<ProtectedParentRoute><VoiceStudio /></ProtectedParentRoute>} />}

      {/* ARABIC */}
      <Route path="/arabic" element={<ArabicHome />} />
      <Route path="/arabic/test" element={<ArabicFinalTest />} />
      <Route path="/arabic/world/letters" element={<LetterWorldBackground><WorldGuard worldId="letters"><LettersWorld /></WorldGuard></LetterWorldBackground>} />
      <Route path="/arabic/world/letters/:letterId" element={<LetterWorldBackground><WorldGuard worldId="letters"><LetterDetail /></WorldGuard></LetterWorldBackground>} />
      <Route path="/arabic/world/letters/:letterId/words/:position" element={<LetterWorldBackground><WorldGuard worldId="letters"><LetterWordsPage /></WorldGuard></LetterWorldBackground>} />
      <Route path="/arabic/world/letters/:letterId/play" element={<LetterWorldBackground><WorldGuard worldId="letters"><LetterGamePage /></WorldGuard></LetterWorldBackground>} />
      <Route path="/arabic/world/harakat" element={<HarakatWorldBackground><WorldGuard worldId="harakat"><HarakatWorld /></WorldGuard></HarakatWorldBackground>} />
      <Route path="/arabic/world/harakat/:harakaType" element={<HarakatWorldBackground><WorldGuard worldId="harakat"><HarakaDetail /></WorldGuard></HarakatWorldBackground>} />
      <Route path="/arabic/world/harakat/:harakaType/play" element={<HarakatWorldBackground><WorldGuard worldId="harakat"><HarakaGamePage /></WorldGuard></HarakatWorldBackground>} />
      <Route path="/arabic/world/syllables" element={<SyllablesWorldBackground><WorldGuard worldId="syllables"><SyllablesWorld /></WorldGuard></SyllablesWorldBackground>} />
      <Route path="/arabic/world/syllables/:letterId" element={<SyllablesWorldBackground><WorldGuard worldId="syllables"><SyllableDetail /></WorldGuard></SyllablesWorldBackground>} />
      <Route path="/arabic/world/syllables/:letterId/:type/play" element={<SyllablesWorldBackground><WorldGuard worldId="syllables"><SyllableGamePage /></WorldGuard></SyllablesWorldBackground>} />
      <Route path="/arabic/world/words" element={<WordsWorldBackground><WorldGuard worldId="words"><WordsWorld /></WorldGuard></WordsWorldBackground>} />
      <Route path="/arabic/world/words/letter/:letterId/:position/play" element={<WordsWorldBackground><WorldGuard worldId="words"><WordPositionGamePage /></WorldGuard></WordsWorldBackground>} />
      <Route path="/arabic/world/words/letter/:letterId/location-game" element={<WordsWorldBackground><WorldGuard worldId="words"><LetterLocationGamePage /></WorldGuard></WordsWorldBackground>} />
      <Route path="/arabic/world/words/letter/:letterId/:position" element={<WordsWorldBackground><WorldGuard worldId="words"><WordLetterDetail /></WorldGuard></WordsWorldBackground>} />
      <Route path="/arabic/world/words/letter/:letterId" element={<WordsWorldBackground><WorldGuard worldId="words"><WordLetterDetail /></WorldGuard></WordsWorldBackground>} />
      <Route path="/arabic/world/words/:wordId/play" element={<WordsWorldBackground><WorldGuard worldId="words"><WordGamePage /></WorldGuard></WordsWorldBackground>} />
      <Route path="/arabic/world/sentences" element={<SentencesWorldBackground><WorldGuard worldId="sentences"><SentencesWorld /></WorldGuard></SentencesWorldBackground>} />
      <Route path="/arabic/world/stories" element={<StoriesWorldBackground><WorldGuard worldId="stories"><StoriesWorld /></WorldGuard></StoriesWorldBackground>} />
      <Route path="/arabic/world/:worldId" element={<WorldPlaceholder />} />

      {/* backward-compat /world/... */}
      <Route path="/world/letters" element={<LetterWorldBackground><WorldGuard worldId="letters"><LettersWorld /></WorldGuard></LetterWorldBackground>} />
      <Route path="/world/letters/:letterId" element={<LetterWorldBackground><WorldGuard worldId="letters"><LetterDetail /></WorldGuard></LetterWorldBackground>} />
      <Route path="/world/letters/:letterId/words/:position" element={<LetterWorldBackground><WorldGuard worldId="letters"><LetterWordsPage /></WorldGuard></LetterWorldBackground>} />
      <Route path="/world/letters/:letterId/play" element={<LetterWorldBackground><WorldGuard worldId="letters"><LetterGamePage /></WorldGuard></LetterWorldBackground>} />
      <Route path="/world/harakat" element={<HarakatWorldBackground><WorldGuard worldId="harakat"><HarakatWorld /></WorldGuard></HarakatWorldBackground>} />
      <Route path="/world/harakat/:harakaType" element={<HarakatWorldBackground><WorldGuard worldId="harakat"><HarakaDetail /></WorldGuard></HarakatWorldBackground>} />
      <Route path="/world/harakat/:harakaType/play" element={<HarakatWorldBackground><WorldGuard worldId="harakat"><HarakaGamePage /></WorldGuard></HarakatWorldBackground>} />
      <Route path="/world/syllables" element={<SyllablesWorldBackground><WorldGuard worldId="syllables"><SyllablesWorld /></WorldGuard></SyllablesWorldBackground>} />
      <Route path="/world/syllables/:letterId" element={<SyllablesWorldBackground><WorldGuard worldId="syllables"><SyllableDetail /></WorldGuard></SyllablesWorldBackground>} />
      <Route path="/world/syllables/:letterId/:type/play" element={<SyllablesWorldBackground><WorldGuard worldId="syllables"><SyllableGamePage /></WorldGuard></SyllablesWorldBackground>} />
      <Route path="/world/words" element={<WordsWorldBackground><WorldGuard worldId="words"><WordsWorld /></WorldGuard></WordsWorldBackground>} />
      <Route path="/world/words/letter/:letterId/:position/play" element={<WordsWorldBackground><WorldGuard worldId="words"><WordPositionGamePage /></WorldGuard></WordsWorldBackground>} />
      <Route path="/world/words/letter/:letterId/location-game" element={<WordsWorldBackground><WorldGuard worldId="words"><LetterLocationGamePage /></WorldGuard></WordsWorldBackground>} />
      <Route path="/world/words/letter/:letterId/:position" element={<WordsWorldBackground><WorldGuard worldId="words"><WordLetterDetail /></WorldGuard></WordsWorldBackground>} />
      <Route path="/world/words/letter/:letterId" element={<WordsWorldBackground><WorldGuard worldId="words"><WordLetterDetail /></WorldGuard></WordsWorldBackground>} />
      <Route path="/world/words/:wordId/play" element={<WordsWorldBackground><WorldGuard worldId="words"><WordGamePage /></WorldGuard></WordsWorldBackground>} />
      <Route path="/world/sentences" element={<SentencesWorldBackground><WorldGuard worldId="sentences"><SentencesWorld /></WorldGuard></SentencesWorldBackground>} />
      <Route path="/world/stories" element={<StoriesWorldBackground><WorldGuard worldId="stories"><StoriesWorld /></WorldGuard></StoriesWorldBackground>} />
      <Route path="/world/:worldId" element={<WorldPlaceholder />} />

      {/* ENGLISH */}
      <Route path="/english" element={<EnglishBackground><EnglishHome /></EnglishBackground>} />
      <Route path="/english/letters" element={<EnglishBackground page="letters"><EnglishLettersWorld /></EnglishBackground>} />
      <Route path="/english/letters/:letterId" element={<EnglishBackground page="letter-detail"><EnglishLetterDetail /></EnglishBackground>} />
      <Route path="/english/phonics" element={<EnglishBackground page="phonics"><EnglishPhonicsWorld /></EnglishBackground>} />
      <Route path="/english/words" element={<EnglishBackground page="words"><EnglishWordsWorld /></EnglishBackground>} />
      <Route path="/english/sentences" element={<EnglishBackground page="sentences"><EnglishSentencesWorld /></EnglishBackground>} />
      <Route path="/english/stories" element={<EnglishBackground page="stories"><EnglishStoriesWorld /></EnglishBackground>} />
      <Route path="/english/test" element={<EnglishBackground page="test"><EnglishFinalTest /></EnglishBackground>} />
      {STUDIO_ENABLED && <Route path="/english/voice-studio" element={<EnglishBackground page="voice-studio"><ProtectedParentRoute><EnglishVoiceStudio /></ProtectedParentRoute></EnglishBackground>} />}

      {/* NUMBERS */}
      <Route path="/numbers" element={<NumbersHome />} />
      <Route path="/numbers/map" element={<NumbersMapPage />} />
      <Route path="/numbers/stage/:id" element={<NumbersStagePage />} />
      <Route path="/numbers/learn/:n" element={<NumbersLearnPage />} />
      <Route path="/numbers/practice/:topic" element={<NumbersPracticePage />} />
      <Route path="/numbers/games" element={<NumbersGamesPage />} />
      <Route path="/numbers/games/:id" element={<NumbersGameDetailPage />} />
      <Route path="/numbers/numberline" element={<NumberLinePage />} />
      <Route path="/numbers/challenge/:id" element={<NumbersChallengePage />} />
      {STUDIO_ENABLED && <Route path="/numbers/voice-studio" element={<ProtectedParentRoute><NumbersVoiceStudio /></ProtectedParentRoute>} />}
      <Route path="/numbers/parent" element={<ProtectedParentRoute><NumbersParentPage /></ProtectedParentRoute>} />

      {/* ==================== DISCOVER MODULE (/discover) ==================== */}
      <Route path="/discover" element={<DiscoverHome />} />
      {STUDIO_ENABLED && <Route path="/discover/voice-studio" element={<ProtectedParentRoute><DiscoverVoiceStudio /></ProtectedParentRoute>} />}
      <Route path="/discover/test" element={<DiscoverFinalTest />} />
      <Route path="/discover/:worldId" element={<WorldPage />} />

      {/* ==================== SKILLS MODULE (/skills) ==================== */}
      <Route path="/skills" element={<SkillsHome />} />
      <Route path="/skills/:gameId" element={<SkillsGamePage />} />
      <Route path="/skills/:gameId/:level" element={<SkillsLevelPage />} />
      {STUDIO_ENABLED && <Route path="/skills/voice-studio" element={<ProtectedParentRoute><VoiceStudio section="skills" /></ProtectedParentRoute>} />}

      {/* ==================== ISLAMIC MODULE (/islamic) — أخلاقي الجميلة ==================== */}
      {islamicRouteElements}
      {STUDIO_ENABLED && <Route path="/islamic/voice-studio" element={<ProtectedParentRoute><VoiceStudio section="islamic" /></ProtectedParentRoute>} />}
    </Routes>
  )
}
